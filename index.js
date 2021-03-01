const { request } = require( '@octokit/request' );
require( 'dotenv' ).config();

console.log();

async function GetRunningActions() {
    const result = await request('GET /repos/{owner}/{repo}/actions/runs', {
        owner: process.env.OWNER ,
        repo: process.env.REPO
      });

    return result;
}

async function GetWorkflowRun( workflowId ) {
    const result = await request('GET /repos/{owner}/{repo}/actions/runs/{run_id}', {
        owner: process.env.OWNER ,
        repo: process.env.REPO,
        run_id: workflowId
      });

    return result;
}
let allCompletedActions = [];

function RecheckActions(actions) {
    const completedActions = actions.filter( action => action.status === "completed" );
    allCompletedActions = [...allCompletedActions, ...completedActions];


    const inprogressActions = actions.filter( action => action.status !== "completed" );

    //  nieskończone dodaj do następnej kolejki sprawdzania
    const awaitedActions = inprogressActions.map(GetWorkflowRun);

    Promise.all( ...awaitedActions ).then( values => {    
        RecheckActions(values);
    });
}

GetRunningActions()
.then( (res) => {

    RecheckActions(res.data.workflow_runs);

    // //Gather all actions that are completed
    // //zbierz ponownie wyniki z inprogressActions
    // //  skończone dodaj do completedActions
    // let completedActions = res.data.workflow_runs.filter( action => action.status === "completed" );
    // const inprogressActions = res.data.workflow_runs.filter( action => action.status !== "completed" );

    // //  nieskończone dodaj do następnej kolejki sprawdzania
    // const awaitedActions = inprogressActions.map(GetWorkflowRun);

    // Promise.all( ...awaitedActions ).then( values => {
    //     const completed = values.filter(action => action.status === "completed");
    //     completedActions = [...completedActions, ...completed];

    //     const incompleted = values.filter(action => action.status !== "completed");
    //     ...
    // });


    //powtarzaj cykl aż minie dużo czasu -> expired
    //OR aż wszystkie bedą skońćzone



    console.log(res.data.workflow_runs);
} )
.catch( ( { message, name, status } ) => {
    console.log( message, name, status );
}); 

