
require( 'dotenv' ).config();

const fs = require('fs')
const path = require('path')
const { spawn } = require("child_process");

const tmpRepoPath = path.join( process.cwd(), 'tmp' );

runCmd( 'rm', [ '-r', '-f', 'tmp' ] )
    .then( runCmd( 'git', ['clone', process.env.TEST_REPO, 'tmp' ] ) )
    .then( runCmd( 'rm', [ '-r', '-f', '*' ], { cwd: tmpRepoPath } ) )
    .then( runCmd( 'git', [ 'add', '.'], { cwd: tmpRepoPath } ) )
    .then( runCmd( 'git', [ 'commit', '-m', 'Add file' ], { cwd: tmpRepoPath } ) )
    .then( runCmd( 'git', [ 'push', 'origin', 'master' ], { cwd: tmpRepoPath } ) );

function runCmd(cmd, args, options) {
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
            console.log(`${cmd} child process exited with code ${code}`);
            resolve('ok')
        });
    });
}
