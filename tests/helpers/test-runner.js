const chalk = require( 'chalk' );
const path = require( 'path' );
const fs = require( 'fs' );

const sendFiles = require( './github/files' );
const { dispatchWorkflow, verifyWorkflowStatus, getRunningWorkflows } = require( './github/workflows' );

function collectFixtures() {
	const fixturesDirectory = path.join( process.cwd(), 'tests/fixtures/' );
	const fixtures = fs.readdirSync( fixturesDirectory, { withFileTypes: true } );
	const tests = [];
	let fixtureSetups = fixtures
		.filter( fixtureFile => fixtureFile.isFile() )
		.flatMap( fixtureFile => {
			return require( path.join( fixturesDirectory, fixtureFile.name ) );
		} );

	fixtureSetups.forEach( fixtureSetup => {
		fixtureSetup.fileList = fixtureSetup.fileList || [];

		// Add project related path to the files path.
		fixtureSetup.fileList.forEach( x => x.src = path.join( 'tests/assets', x.src ) );

		// Add workflow configuration file to files list that will be commited.
		fixtureSetup.fileList.unshift( {
			src: 'workflows/' + fixtureSetup.workflow,
			dest: '.github/workflows/' + fixtureSetup.workflow
		} );
	} );

	return fixtureSetups;
}

async function runTests( tests ) {
	for ( let testCase of tests ) {
		console.log( '\n *** Running test for: ' + chalk.blue( testCase.name ) + ' ***' );
		await runTest( testCase );
	}

	console.log( '--- --- ---' );
	console.log( '--- --- ---' );
	console.log( `Testing finished! Your testing repo: https://github.com/${ process.env.OWNER }/${ process.env.REPO }` );
}

async function runTest( testCase ) {
	console.log( `Pushing files to ${ chalk.blue( process.env.REPO ) } repo on ${ chalk.blue( testCase.branch ) } branch` );

	const results = await sendFiles( testCase.branch, testCase.fileList );

	for( let result of results ) {
		console.log( `\tFile ${ chalk.blue( result.file ) } ( ${ chalk.green( result.status ) }: ${ result.msg } )` );
	}

	const foundErrors = results.filter( result => ![ 200, 201 ].includes( result.status ) );
	if ( foundErrors.length > 0 ) {
		console.log( chalk.red( 'Skip test due to errors!' ) );
		return;
	}

	await dispatchWorkflow( testCase.workflow, testCase.branch, testCase.config );

	// GH need some time before workflow is actually available as `queued`
	await timeout( 2000 );
	const actions = await getRunningWorkflows();

	// First action is the latest one - recently dispatched
	const workflow = actions.data.workflow_runs[ 0 ];
	console.log( 'Verify status of: ' + chalk.blue( workflow.name ) );

	const result = await verifyWorkflowStatus( workflow, ( workflowObject, waitingTime ) => {
		console.log( `Status: ${ chalk.yellow( workflowObject.status ) }. Result: ${ chalk.yellow( workflowObject.conclusion ) }. Next check in ${ waitingTime }ms` );
	} );

	console.log( chalk.green( '"' + result.name + '" run is finished!' ) + ' Result: ' + chalk.yellow( result.conclusion ) );
	console.log( `Details: https://github.com/${ process.env.OWNER }/${ process.env.REPO }/actions/runs/${ workflow.id }` );
}

function timeout( time ) {
	return new Promise( resolve => setTimeout( resolve, time ) );
}

module.exports = { runTests, collectFixtures };
