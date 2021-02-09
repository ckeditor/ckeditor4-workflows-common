#https://docs.github.com/en/rest/reference/repos#list-commits
#https://docs.github.com/en/rest/reference/repos#get-a-commit
















# Get last commit sha in master branch
# bSha=$( gh api /repos/ckeditor/workflow-tests-PR-6/git/refs/heads | jq -c '.[] | select(.ref | contains("refs/heads/master"))' | jq -c -r '.object.sha' )

#echo ${bSha}

#new branch from clear repo - next step require SHA of updated file if there is tsth to update - don't want this
#create branch on workflow test repo
#gh api --method POST -F ref="refs/heads/testBRANCH" -F sha=${bSha} /repos/ckeditor/workflow-tests-PR-6/git/refs





#put all files in workflow to testing repo new branch '.github/workflows` & cfg file to `.github`
#https://docs.github.com/en/rest/reference/repos#create-or-update-file-contents
workflowFiles=( ./workflows/*)

for file in ${workflowFiles[@]}
do
    stalebotContent=$( base64 $file )
    # echo $file
    make a proper url and send!
    apiUrl = "/repos/ckeditor/workflow-tests-PR-6/contents/.github/k"
    
    gh api --method PUT -F branch="testBRANCH" -F message="Update workflow file" /repos/ckeditor/workflow-tests-PR-6/contents/.github/k -F content="${stalebotContent}"
done

























# Get actions list
# actionList=$( gh api /repos/ckeditor/workflow-tests-PR-6/actions/workflows | jq -c ".workflows | map(.id) | .[]" )

# for actionId in "${actionList[@]}"
# do
#     #dispatch workflows
#     gh api --method POST -F ref="master" /repos/ckeditor/workflow-tests-PR-6/actions/workflows/$actionId/dispatches | jq -c ".workd"
# done


#list running actions
#https://docs.github.com/en/rest/reference/actions#list-workflow-runs-for-a-repository
#gh api /repos/ckeditor/workflow-tests-PR-6/actions/runs | jq -c ".workflow_runs | map({ name: .name, id: .id, status: .status, conclusion: .conclusion }) | .[]"
