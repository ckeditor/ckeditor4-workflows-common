const fs = require( 'fs' );
const GitHubClient = require ( './client' );

async function sendFiles( branch, files ) {
	const results = [];

	for ( let file of files ) {
		const result = await sendFile( branch, file.src, file.dest );

		results.push( {
			status: result.status,
			file: file.src,
			msg: result.status === 200 ? 'OK' : result.toString()
		} );
	}

	return results;
}

async function sendFile( branch, sourceFilePath, destinationFilePath ) {
	const newContent = fs.readFileSync( sourceFilePath, {
		encoding: 'base64'
	} );

	try {
		const file = await getFile( destinationFilePath, branch );

		const sha = file.status === 404 ? undefined : file.data.sha;
		const commitResult = await commitFile( sha, newContent, destinationFilePath, branch );

		return commitResult;
	} catch( e ) {
		return e;
	}
}

async function getFile( path, branch ) {
	const result = await GitHubClient.request( 'GET', '/repos/{owner}/{repo}/contents/{path}?ref={ref}', {
		headers: {
			authorization: 'token ' + process.env.AUTH_KEY
		},
		owner: process.env.OWNER ,
		repo: process.env.REPO,
		path: path,
		ref: branch,
	} );

	return result;
}

async function commitFile( sha, content, filePath, branch ) {
	const result = await GitHubClient.request( 'PUT', '/repos/{owner}/{repo}/contents/{path}', {
		headers: {
			authorization: 'token ' + process.env.AUTH_KEY
		},
		owner: process.env.OWNER ,
		repo: process.env.REPO,
		path: filePath,
		branch: branch,
		sha: sha,
		content: content,
		message: 'Update file ' + filePath,
	} );

	return result;
}

module.exports = sendFiles;
