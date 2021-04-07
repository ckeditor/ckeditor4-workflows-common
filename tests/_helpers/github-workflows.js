const chalk = require( 'chalk' );
const GitHubClient = require( './github-client' );

function verifyWorkflowStatus(workflowObject, waitingTime) {
	return new Promise( ( resolve, reject ) => {
		if( workflowObject.status === 'completed' ) {
			console.log( chalk.green( `${workflowObject.name} run is finished!` ) + ' Result: ' + chalk.yellow( workflowObject.conclusion ) );

			resolve();
			return;
		}
		waitingTime = waitingTime || 1000;

		console.log( `status: ${chalk.yellow( workflowObject.status )}. Result: ${chalk.yellow( workflowObject.conclusion)}. Next check in ${waitingTime}ms` );

		setTimeout( async () => {
			const workflow = await getWorkflowRun( workflowObject.id );
			// Give some time between rechecks
			await verifyWorkflowStatus( workflow.data, waitingTime + 3500 );
			resolve();
		}, waitingTime );
	} );
}

async function getRunningActions() {
	const result = await GitHubClient.request( 'GET', '/repos/{owner}/{repo}/actions/runs', {
		headers: {
			authorization: 'token ' + process.env.AUTH_KEY
		},
		owner: process.env.OWNER ,
		repo: process.env.REPO
	  });

	return result;
}

async function getWorkflowRun( workflowId ) {
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

async function dispatchWorkflow( workflowId, branch, input ) {
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

module.exports = { dispatchWorkflow, verifyWorkflowStatus, getRunningActions }
