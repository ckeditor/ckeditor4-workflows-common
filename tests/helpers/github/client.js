const { request } = require( '@octokit/request' );

const GitHubClient = {
	request: async function ( method, url, parameters ) {
		try {
			const result = await request( `${ method } ${ url }`, parameters );
			return result;
		} catch( e ) {
			return e;
		}
	}
};

module.exports = GitHubClient;
