const chalk = require( 'chalk' );
const sendFiles = require('./github-files');
const { dispatchWorkflow, verifyWorkflowStatus, getRunningActions } = require( './github-workflows' );

async function runTests( tests ) {
	const testCase = tests.shift();

	if( testCase ) {
		console.log( '\n *** Running test for: ' + chalk.blue( testCase.name ) + ' ***');
		await runTest( testCase );
		return runTests( tests );
	}
}

async function runTest( testCase ) {
	return new Promise( async ( resolve, reject ) => {
		await sendFiles( testCase.branch, testCase.filesList );

		console.log( 'All files pushed to repo at ' + chalk.blue( testCase.branch ) + ' branch' );

		await dispatchWorkflow( testCase.name, testCase.branch, testCase.input );

		// GH need some time before workflow is actually available as `queued`
		setTimeout( async () => {
			const actions = await getRunningActions();

			// First action is the latest one - recently dispatched
			const workflow = actions.data.workflow_runs[0];
			console.log( 'Verify status of: ' + chalk.blue( workflow.name ) );

			await verifyWorkflowStatus( workflow );
			resolve();
		}, 2000);
	} );
}

module.exports = { runTests };
