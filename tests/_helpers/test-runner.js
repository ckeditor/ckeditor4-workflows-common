const chalk = require( 'chalk' );
const sendFiles = require( './github-files' );
const { dispatchWorkflow, verifyWorkflowStatus, getRunningActions } = require( './github-workflows' );

async function runTests( tests ) {
	const testCase = tests.shift();

	if( testCase ) {
		console.log( '\n *** Running test for: ' + chalk.blue( testCase.name ) + ' ***' );
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
			const workflow = actions.data.workflow_runs[ 0 ];
			console.log( 'Verify status of: ' + chalk.blue( workflow.name ) );

			const result = await verifyWorkflowStatus( workflow, ( workflowObject, waitingTime ) => {
				console.log( `Status: ${ chalk.yellow( workflowObject.status ) }. Result: ${ chalk.yellow( workflowObject.conclusion ) }. Next check in ${ waitingTime }ms` );
			} );

			console.log( chalk.green( result.name + 'run is finished!' ) + ' Result: ' + chalk.yellow( result.conclusion ) );

			resolve();
		}, 2000);
	} );
}

module.exports = { runTests };
