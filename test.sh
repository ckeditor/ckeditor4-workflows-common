#create empty repo
#add selected files to .github/workflows & add settings if provided
#via gh api - run workflow & watch results

# https://stedolan.github.io/jq/download/
#gh api /repos/ckeditor/workflow-tests-PR-6/actions/workflows | jq -c ".workflows | map({ name: .name, id: .id }) | .[]"

#dispatch workflows
#gh api --method POST -F ref="master" /repos/ckeditor/workflow-tests-PR-6/actions/workflows/5661822/dispatches | jq -c ".workd"

#list running actions
#https://docs.github.com/en/rest/reference/actions#list-workflow-runs-for-a-repository
#gh api /repos/ckeditor/workflow-tests-PR-6/actions/runs | jq -c ".workflow_runs | map({ name: .name, id: .id, status: .status, conclusion: .conclusion }) | .[]"

#put to variable https://stackoverflow.com/questions/2559076/how-do-i-redirect-output-to-a-variable-in-shell

bSha=$( gh api /repos/ckeditor/workflow-tests-PR-6/git/refs/heads | jq -c '.[] | select(.ref | contains("refs/heads/master"))' | jq -c '.object.sha' )

echo ${bSha}

#create branch on workflow test repo
# gh api --method POST /repos/ckeditor/workflow-tests-PR-6/git/refs/heads/sc/featureA











# #create repo for tests
# # gh repo create workflows-auto-tests --private -y

# #delete test repo
# gh api --method DELETE repos/sculpt0r/workflows-auto-tests