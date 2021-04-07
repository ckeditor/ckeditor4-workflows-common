const fs = require( 'fs' );
const GitHubClient = require ( './github-client' );

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

async function sendFile(branch, sourceFilePath, destinationFilePath) {
	const newContent = fs.readFileSync( sourceFilePath, {
		encoding: 'base64'
	} );

	const file = await getFile( destinationFilePath, branch );
	await commitFile( file.data.sha, newContent, destinationFilePath, branch );
}

async function sendFiles( branch, files ) {
	const nextFile = files.shift();

	if( nextFile ) {
		await sendFile( branch, nextFile.src, nextFile.dest );
		return sendFiles( branch, files );
	}
}

module.exports = sendFiles;
