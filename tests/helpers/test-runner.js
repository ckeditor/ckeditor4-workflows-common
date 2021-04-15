const chalk = require( 'chalk' );
const sendFiles = require( './github/files' );
const { dispatchWorkflow, verifyWorkflowStatus, getRunningWorkflows } = require( './github/workflows' );
const path = require( 'path' );
const fs = require( 'fs' );

function collectFixtures() {
	const tests = [];
	const fixturesDirectory = path.join( process.cwd(), 'tests/fixtures/' );
	const fixtures = fs.readdirSync( fixturesDirectory, { withFileTypes: true } );

	for( let fixture of fixtures ) {
		if ( fixture.isDirectory() ) {
			const fixturePath = path.join( 'tests/fixtures', fixture.name );

			const modulePath = path.join( process.cwd(), fixturePath, 'index' );

			if ( fs.existsSync( modulePath + '.js' ) ) {
				const setup = require( modulePath );
				setup.filesList.forEach( x => x.src = path.join( fixturePath, x.src ) );
				//console.log(setup.filesList);
				//console.log('***');
				// Add workflow file to files that will be commited
				setup.filesList.unshift( {
					src: 'workflows/' + setup.workflow,
					dest: '.github/workflows/' + setup.workflow
				} );
				tests.push( setup );
			}
		}
	}

	return tests;
}

async function runTests( tests ) {
	for(let testCase of tests) {
		console.log( '\n *** Running test for: ' + chalk.blue( testCase.name ) + ' ***' );
		await runTest(testCase);
	}
}

async function runTest( testCase ) {
	console.log( `Pushing files to ${ chalk.blue( process.env.REPO ) } repo on ${ chalk.blue( testCase.branch ) } branch` );

	const results = await sendFiles( testCase.branch, testCase.filesList );

	for( let result of results ) {
		console.log( `\tFile ${ chalk.blue( result.file ) } ( ${ chalk.green( result.status ) }: ${ result.msg } )` );
	}

	const foundErrors = results.filter( result => result.status !== 200 );
	if( foundErrors.length > 0 ) {
		console.log( chalk.red( 'Skip test due to errors!' ) );
		return;
	}

	await dispatchWorkflow( testCase.name, testCase.branch, testCase.input );

	// GH need some time before workflow is actually available as `queued`
	await timeout( 2000 );
	const actions = await getRunningWorkflows();

	// First action is the latest one - recently dispatched
	const workflow = actions.data.workflow_runs[ 0 ];
	console.log( 'Verify status of: ' + chalk.blue( workflow.name ) );

	const result = await verifyWorkflowStatus( workflow, ( workflowObject, waitingTime ) => {
		console.log( `Status: ${ chalk.yellow( workflowObject.status ) }. Result: ${ chalk.yellow( workflowObject.conclusion ) }. Next check in ${ waitingTime }ms` );
	} );

	console.log( chalk.green( result.name + 'run is finished!' ) + ' Result: ' + chalk.yellow( result.conclusion ) );
}

function timeout( time ) {
	return new Promise( resolve => setTimeout( resolve, time ) );
}

module.exports = { runTests, collectFixtures };
