
require( 'dotenv' ).config();

const fs = require('fs')
const path = require('path')
const { spawn } = require("child_process");
const { request } = require( '@octokit/request' );

// request.defaults({
//     headers: {
//         authorization: process.env.AUTH_KEY
//     }
// })

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
console.log(tmpRepoPath);
function giting(){

// .then(x =>  runCmd( 'rm', [ '-rf', '*' ], { cwd: tmpRepoPath } ) )
runCmd( 'rm', [ '-rf', 'tmp' ] )
    .then(x => runCmd( 'git', ['clone', process.env.TEST_REPO, 'tmp' ] ) )
    .then( () => {
        filesList.forEach( entry => {
            fs.copyFileSync( entry.src, path.join(tmpRepoPath, entry.dest ) );
        } );
        return Promise.resolve();
    })
    .then (() => {
        process.chdir('tmp')
        return Promise.resolve();
    })
    .then( runCmd( 'git', [ 'add', '.'], { cwd: tmpRepoPath } ) )
    // .then( runCmd( 'git', [ 'commit', '-m', 'Add file' ], { cwd: tmpRepoPath } ) )
    // .then( runCmd( 'git', [ 'push', 'origin', 'master' ], { cwd: tmpRepoPath } ) );
    .then( runCmd( 'git', [ 'remote', 'show', 'origin' ], { cwd: tmpRepoPath } ) );

    function runCmd(cmd, args , options) {
    return new Promise((resolve, reject) => {
        const command = spawn( cmd,  args, options );

        command.stdout.on("data", data => {
            console.log(`stdout: ${data}`);
        });
    
        command.stderr.on("data", data => {
            console.log(`stderr: ${data}`);
        });
    
        command.on('error', (error) => {
            console.log(`error: ${error.message}`);
        });
    
        command.on("close", code => {
            console.log(...args);
            console.log(`-- -- exited with code ${code}`);
            resolve('ok')
        });
    });
}
}

async function CommitFile( sha, content, filePath, branch ) {
    const result = await request('PUT /repos/{owner}/{repo}/contents/{path}', {
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
        auth: process.env.AUTH_KEY
      });

    return result;
}


//get file from repo to get sha to update it
async function GetFile( path, branch ) {
    const result = await request('GET /repos/{owner}/{repo}/contents/{path}?ref={ref}', {
        owner: process.env.OWNER ,
        repo: process.env.REPO,
        path: path,
        ref: branch,
      });

    return result;
}


const branch = 'master';
const filePath = '.github/workflows-config.json';
const newContent = fs.readFileSync('workflows-config.json', {
    encoding: 'base64'
});

GetFile(filePath, branch)
    .then( res => res.data.sha)
    .then( sha => {

        CommitFile(sha, newContent, filePath, branch)
        .then(res => console.log(res))
        .catch(why => console.log('an catch occured', why.status, why.name, why.request))

    } )
    .catch(why => console.warn('File not found'))

