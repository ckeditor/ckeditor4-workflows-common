#create empty repo
#add selected files to .github/workflows & add settings if provided
#via gh api - run workflow & watch results

# bSha=$( gh api /repos/ckeditor/workflow-tests-PR-6/git/refs/heads | jq -c '.[] | select(.ref | contains("refs/heads/master"))' | jq -c -r '.object.sha' )

#echo ${bSha}

#new branch from clear repo - next step require SHA of updated file if there is tsth to update - don't want this
#create branch on workflow test repo
#gh api --method POST -F ref="refs/heads/testBRANCH" -F sha=${bSha} /repos/ckeditor/workflow-tests-PR-6/git/refs

#put all files in workflow to testing repo new branch '.github/workflows` & cfg file to `.github`
#https://docs.github.com/en/rest/reference/repos#create-or-update-file-contents
#stalebotContent=$( base64 workflows/stalebot.yml )
#gh api --method PUT -F branch="testBRANCH" -F message="update stalebot" /repos/ckeditor/workflow-tests-PR-6/contents/.github/workflows/stalebot.yml -F content="${stalebotContent}"


# https://stedolan.github.io/jq/download/
gh api /repos/ckeditor/workflow-tests-PR-6/actions/workflows | jq -c ".workflows | map({ name: .name, id: .id }) | .[]"

#dispatch workflows
#gh api --method POST -F ref="master" /repos/ckeditor/workflow-tests-PR-6/actions/workflows/5661822/dispatches | jq -c ".workd"

#list running actions
#https://docs.github.com/en/rest/reference/actions#list-workflow-runs-for-a-repository
#gh api /repos/ckeditor/workflow-tests-PR-6/actions/runs | jq -c ".workflow_runs | map({ name: .name, id: .id, status: .status, conclusion: .conclusion }) | .[]"
