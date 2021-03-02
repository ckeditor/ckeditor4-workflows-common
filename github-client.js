const { request } = require( '@octokit/request' );

const GitHubClient = {
	request: async function (method, url, parameters) {
		return await request(`${method} ${url}`, parameters);
	}
};

module.exports = GitHubClient;
