
require( 'dotenv' ).config();

const fs = require('fs')
const path = require('path')
const { spawn } = require("child_process");

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
