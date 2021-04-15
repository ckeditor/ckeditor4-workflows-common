const GitHubClient = require( './client' );

async function verifyWorkflowStatus( workflowObject, reportCurrentStatus, waitingTime ) {
	if( workflowObject.status === 'completed' ) {
		return workflowObject;
	}
	waitingTime = waitingTime || 1000;

	reportCurrentStatus( workflowObject, waitingTime );

	await timeout( waitingTime );
	const workflow = await getWorkflowRunResults( workflowObject.id );

	// Give some additional time between rechecks
	return await verifyWorkflowStatus( workflow.data, reportCurrentStatus, waitingTime + 3500 );
}

async function getRunningWorkflows() {
	const result = await GitHubClient.request( 'GET', '/repos/{owner}/{repo}/actions/runs', {
		headers: {
			authorization: 'token ' + process.env.AUTH_KEY
		},
		owner: process.env.OWNER ,
		repo: process.env.REPO
	  });

	return result;
}

async function getWorkflowRunResults( workflowId ) {
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
	const result = await GitHubClient.request( 'POST', '/repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches', {
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

function timeout( time ) {
    return new Promise( resolve => setTimeout( resolve, time ) );
}

module.exports = { dispatchWorkflow, verifyWorkflowStatus, getRunningWorkflows };
