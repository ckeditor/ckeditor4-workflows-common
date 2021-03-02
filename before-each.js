
require( 'dotenv' ).config();

const fs = require( 'fs' )
const path = require( 'path' )
const { spawn } = require("child_process");
const { request } = require( '@octokit/request' );
const { rejects } = require('assert');

const tmpRepoPath = path.join( process.cwd(), 'tmp' );

const filesList = [
        {
            src: 'workflows/setup-workflows.yml',
            dest: '.github/workflows/setup-workflows.yml' 
        },
        {
            src: 'workflows-config.json',
            dest: '.github/workflows-config.json' 
        },
]

async function CommitFile( sha, content, filePath, branch ) {
    const result = await request( 'PUT /repos/{owner}/{repo}/contents/{path}', {
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
      });

    return result;
}

async function GetFile( path, branch ) {
    const result = await request( 'GET /repos/{owner}/{repo}/contents/{path}?ref={ref}', {
        headers: {
            authorization: 'token ' + process.env.AUTH_KEY
        },
        owner: process.env.OWNER ,
        repo: process.env.REPO,
        path: path,
        ref: branch,
      });

    return result;
}

function SendFile(branch, sourceFilePath, destinationFilePath) {
    return new Promise((res, rej) => {

    const newContent = fs.readFileSync(sourceFilePath, {
        encoding: 'base64'
    });
        GetFile(destinationFilePath, branch)
        .then( res => res.data.sha)
        .then( sha => {

            CommitFile(sha, newContent, destinationFilePath, branch)
            .then(result => {
                res(result)
            })
            .catch(why => {
                console.log(why);
                console.log( 'an catch occured', why.status, why.name)
                
            } );


        } )
        .catch(why => console.warn( 'File not found' ) );
    } )
}

function SendFiles( branch, files ) {
console.log('runned wiht', files);
    const nextFile = files.shift();

    if(nextFile) {
        return SendFile( branch, nextFile.src, nextFile.dest )
                .then( r => SendFiles( branch, files ) );
    } else {
        return Promise.resolve();
    }
}

module.exports = SendFiles;