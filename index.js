'use strict';

const { request } = require( '@octokit/request' );
require( 'dotenv' ).config();
const SendFiles = require( './before-each' );

const tests = {
	'test setup-workflows': {
		name: 'setup-workflows.yml',
		branch: 'master',
		filesList: [
			{
				src: 'workflows/setup-workflows.yml',
			   dest: '.github/workflows/setup-workflows.yml'
			},
			{
				src: 'workflows-config.json',
				dest: '.github/workflows-config.json'
			},
		]
	}
};

for( const testName in tests ) {
	console.log( 'Running: ' + testName );
	const testCase = tests[ testName ];

	SendFiles( testCase.branch, testCase.filesList)
	.then( x => {
		console.log( 'all sends finished', x );

		DispatchWorkflow( testCase.name,testCase.branch )
			.then( res => {
				// GH need some time before actually workflow is available as `quened`
				setTimeout( () => {
					GetRunningActions()
					.then( results => {
						const wf =results.data.workflow_runs[0];
						// const { id, conclusion, status, name, created_at, updated_at } = wf;
						RecheckAction( wf);
					} );
				}, 1000);
			} )
			.catch( why => console.log( 'ERROR', why ) );
	} );
}

async function GetRunningActions() {
	const result = await request( 'GET /repos/{owner}/{repo}/actions/runs', {
		headers: {
			authorization: 'token ' + process.env.AUTH_KEY
		},
		owner: process.env.OWNER ,
		repo: process.env.REPO
	  });

	return result;
}

async function GetWorkflowRun( workflowId ) {
	const result = await request( 'GET /repos/{owner}/{repo}/actions/runs/{run_id}', {
		headers: {
			authorization: 'token ' + process.env.AUTH_KEY
		},
		owner: process.env.OWNER ,
		repo: process.env.REPO,
		run_id: workflowId
	  });

	return result;
}

let allCompletedActions = [];

let dots = '.';
let waitingTime = 1000;

function RecheckAction(wfObject) {
	if(wfObject.status === "completed"){
		console.log("Completed &&  ::: " + wfObject.conclusion );
		return;
	}
	dots += '.'
	waitingTime += 3500;
	console.log( wfObject.status + ' :: ' + wfObject.conclusion );
	console.log( 'Let me check again' + dots);

	GetWorkflowRun(wfObject.id)
		.then( workflow => {
			// Give some time between rechecks
			setTimeout( () => {
				RecheckAction( workflow.data );
			}, waitingTime);
		});
}

async function DispatchWorkflow( workflowId, branch ) {
	const result = await request( 'POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches', {
		headers: {
			authorization: 'token ' + process.env.AUTH_KEY
		},
		owner: process.env.OWNER ,
		repo: process.env.REPO,
		workflow_id: workflowId,
		ref: branch
	  });

	return result;
}
