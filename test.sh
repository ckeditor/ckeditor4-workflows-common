# Assume that testing repo has first "empty" commit

#https://docs.github.com/en/rest/reference/repos#list-commits
#https://docs.github.com/en/rest/reference/repos#get-a-commit
















# Get last commit sha in master branch
# bSha=$( gh api /repos/ckeditor/workflow-tests-PR-6/git/refs/heads | jq -c '.[] | select(.ref | contains("refs/heads/master"))' | jq -c -r '.object.sha' )

# Hardcoded initial empty commit
bSha="ae15364ec3c7cceb7a0624284e4627cc1088ad99"

echo ${bSha}

#new branch from clear repo - next step require SHA of updated file if there is tsth to update - don't want this
#create branch on workflow test repo
#gh api --method POST -F ref="refs/heads/testBRANCH" -F sha=${bSha} /repos/ckeditor/workflow-tests-PR-6/git/refs

#Reset master branch to initial commit
gh api --method PATCH -F sha=$bSha -F force="true" /repos/ckeditor/workflow-tests-PR-6/git/refs/heads/master













#put all files in workflow to testing repo new branch '.github/workflows` & cfg file to `.github`
#https://docs.github.com/en/rest/reference/repos#create-or-update-file-contents
workflowFiles=( ./workflows/*)

for file in ${workflowFiles[@]}
do
    stalebotContent=$( base64 $file )
    # echo $file
    #make a proper url and send!
    apiUrl="/repos/ckeditor/workflow-tests-PR-6/contents/.github/${file:1}"
    #echo $apiUrl 
    #gh api --method PUT $apiUrl -F branch="testBRANCH" -F message="Update workflow file" -F content="${stalebotContent}"
done

# Get actions list
# actionList=$( gh api /repos/ckeditor/workflow-tests-PR-6/actions/workflows | jq -c ".workflows | map(.id) | .[]" )

# dispatach all available workflows
# for actionId in "${actionList[@]}"
# do
#     #dispatch workflows
#     gh api --method POST -F ref="master" /repos/ckeditor/workflow-tests-PR-6/actions/workflows/$actionId/dispatches | jq -c ".workd"
# done


#list running actions
#https://docs.github.com/en/rest/reference/actions#list-workflow-runs-for-a-repository
#gh api /repos/ckeditor/workflow-tests-PR-6/actions/runs | jq -c ".workflow_runs | map({ name: .name, id: .id, status: .status, conclusion: .conclusion }) | .[]"
