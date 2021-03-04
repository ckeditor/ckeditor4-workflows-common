'use strict';

const dotenv = require( 'dotenv' ),
	chalk = require('chalk'),
	GitHubClient = require ( './github-client' ),
	SendFiles = require( './before-each' );

dotenv.config();
const allTestsResults = [];
const tests = [
	{
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
	},
	{
		name:'update-deps.yml',
		branch: 'master',
		filesList: [
			{
				src: 'workflows/update-deps.yml',
				dest: '.github/workflows/update-deps.yml'
			}
		]
	}
];

RunTests( tests );

async function RunTests( tests ) {
	const testCase = tests.shift();

	if( testCase ) {
		console.log( 'Running test for: ' + chalk.blue( testCase.name ) );
		await RunTest( testCase );
		return RunTests( tests );
	} else {
		return Promise.resolve();
	}
}

async function RunTest( testCase ) {
	return new Promise( async ( resolve, reject ) => {
		await SendFiles( testCase.branch, testCase.filesList );

		console.log( 'All files pushed to repo at ' + chalk.blue( testCase.branch ) + ' branch' );

		await DispatchWorkflow( testCase.name, testCase.branch, testCase.input );

		// GH need some time before workflow is actually available as `queued`
		setTimeout( async () => {
			const actions = await GetRunningActions();

			// First action is the latest one - recently dispatched
			const workflow = actions.data.workflow_runs[0];
			console.log( 'Verify status of: ' + chalk.blue( workflow.name ) );

			await VerifyWorkflowStatus( workflow );
			resolve();
		}, 2000);
	} );
}

function VerifyWorkflowStatus(workflowObject, waitingTime) {
	return new Promise( ( resolve, reject ) => {
		if( workflowObject.status === 'completed' ) {
			console.log( chalk.green( `${workflowObject.name} run is finished!` ) + ' Result: ' + chalk.yellow( workflowObject.conclusion ) );

			resolve();
			return;
		}
		waitingTime = waitingTime || 1000;

		console.log( 'status: ' + chalk.yellow( workflowObject.status ) + '. Result: ' + chalk.yellow( workflowObject.conclusion ) );
		console.log( `Next check in ${waitingTime}ms` );

		setTimeout( async () => {
			const workflow = await GetWorkflowRun( workflowObject.id );
			// Give some time between rechecks
			await VerifyWorkflowStatus( workflow.data, waitingTime + 3500 );
			resolve();
		}, waitingTime );
	} );
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

async function DispatchWorkflow( workflowId, branch, input ) {
	const result = await GitHubClient.request(
		'POST',
		'/repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches',
		{
			headers: {
				authorization: 'token ' + process.env.AUTH_KEY
			},
			owner: process.env.OWNER,
			repo: process.env.REPO,
			workflow_id: workflowId,
			ref: branch,
			inputs: input
		}
	);

	return result;
}
