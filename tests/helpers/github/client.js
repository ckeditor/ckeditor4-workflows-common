const { request } = require( '@octokit/request' );

const GitHubClient = {
	request: async function ( method, url, parameters ) {
		try {
			const result = await request( `${ method } ${ url }`, parameters );
		} catch( e ) {
			console.log( e );
			const result = e;
		}

		return result;
	}
};

module.exports = GitHubClient;
