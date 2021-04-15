const chalk = require( 'chalk' );
const sendFiles = require( './github-files' );
const { dispatchWorkflow, verifyWorkflowStatus, getRunningWorkflows } = require( './github-workflows' );

async function runTests( tests ) {
	for(let testCase of tests) {
		console.log( '\n *** Running test for: ' + chalk.blue( testCase.name ) + ' ***' );
		await runTest(testCase);
	}
}

async function runTest( testCase ) {
	return new Promise( async ( resolve, reject ) => {
		console.log( `Pushing files to ${ chalk.blue( process.env.REPO ) } repo on ${ chalk.blue( testCase.branch ) } branch` );

		const results = await sendFiles( testCase.branch, testCase.filesList );

		for( let result of results ) {
			console.log( `File ${ chalk.blue( result.file ) } ( ${ chalk.green( result.status ) }: ${ result.msg } )` );
		}

		const foundErrors = results.filter( result => result.status !== 200 );
		if( foundErrors.length > 0 ) {
			console.log( chalk.red( 'Skip test due to errors!' ) );
			resolve();
			return;
		}

		await dispatchWorkflow( testCase.name, testCase.branch, testCase.input );

		// GH need some time before workflow is actually available as `queued`
		setTimeout( async () => {
			const actions = await getRunningWorkflows();

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
