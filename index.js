'use strict';

const dotenv = require( 'dotenv' ),
	chalk = require('chalk'),
	GitHubClient = require ( './github-client' ),
	SendFiles = require( './before-each' );

dotenv.config();

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

RunTests(tests);

function RunTests( tests ) {
	for( const testName in tests ) {
		console.log( 'Running test for: ' + chalk.blue( testName ) );
		const testCase = tests[ testName ];

		SendFiles( testCase.branch, testCase.filesList )
		.then( _ => {
			console.log( 'All files pushed to repo at ' + chalk.blue( testCase.branch ) + ' branch' );

			DispatchWorkflow( testCase.name,testCase.branch )
				.then( res => {
					// GH need some time before workflow is actually available as `queued`
					setTimeout( () => {
						GetRunningActions()
							.then( actions => {
								// First action is the latest one - recently dispatched
								const workflow = actions.data.workflow_runs[0];
								console.log( 'Verify status of: ' + chalk.blue( workflow.name ) );
								VerifyWorkflowStatus( workflow );
							} );
					}, 2000);
				} )
				.catch( reason => console.log( 'ERROR', reason ) );
		} );
	}
}

async function GetRunningActions() {
	const result = await GitHubClient.request( 'GET', '/repos/{owner}/{repo}/actions/runs', {
		headers: {
			authorization: 'token ' + process.env.AUTH_KEY
		},
		owner: process.env.OWNER ,
		repo: process.env.REPO
	  });

	return result;
}

async function GetWorkflowRun( workflowId ) {
	const result = await GitHubClient.request(
		'GET',
		'/repos/{owner}/{repo}/actions/runs/{run_id}',
		{
			headers: {
				authorization: 'token ' + process.env.AUTH_KEY
			},
			owner: process.env.OWNER ,
			repo: process.env.REPO,
			run_id: workflowId
		}
	);

	return result;
}

function VerifyWorkflowStatus(workflowObject, waitingTime) {
	if(workflowObject.status === "completed"){
		console.log( chalk.green( `${workflowObject.name} run is finished!` ) + ' Result: ' + chalk.yellow( workflowObject.conclusion ) );
		return;
	}
	waitingTime = waitingTime || 1000;

	console.log( 'status: ' + chalk.yellow( workflowObject.status ) + '. Result: ' + chalk.yellow( workflowObject.conclusion ) );
	console.log( `Next check in ${waitingTime}ms` );

	GetWorkflowRun( workflowObject.id )
		.then( workflow => {
			// Give some time between rechecks
			setTimeout( () => {
				VerifyWorkflowStatus( workflow.data, waitingTime + 3500 );
			}, waitingTime );
		});
}

async function DispatchWorkflow( workflowId, branch ) {
	const result = await GitHubClient.request(
		'POST',
		'/repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches',
		{
			headers: {
				authorization: 'token ' + process.env.AUTH_KEY
			},
			owner: process.env.OWNER ,
			repo: process.env.REPO,
			workflow_id: workflowId,
			ref: branch
		}
	);

	return result;
}
