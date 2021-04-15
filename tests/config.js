const dotenv = require( 'dotenv' );

function config() {
	dotenv.config();

	verifyEnvVariables( [ 'AUTH_KEY', 'OWNER', 'REPO' ] );
}

function verifyEnvVariables( requiredVariables ) {
	let anyMissingVariable =  false;

	requiredVariables.forEach( variable => {
		if ( !process.env[ variable ] ) {

			console.log( chalk.red( `Missing ${ variable } env variable!` ) );

			anyMissingVariable = true;
		}
	} );

	if( anyMissingVariable ) {
		process.exit( -1 );
	}
}

module.exports = config;
