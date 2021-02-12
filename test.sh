# Assume that testing repo has first "empty" commit

# Hardcoded initial empty commit
bSha="ae15364ec3c7cceb7a0624284e4627cc1088ad99"

printf "\nReset master branch to initial commit\n"
gh api --method PATCH -F sha=$bSha -F force="true" /repos/ckeditor/workflow-tests-PR-6/git/refs/heads/master

printf "\nGather running actions\n"
#https://docs.github.com/en/rest/reference/actions#list-workflow-runs-for-a-repository
repoActions=$( gh api /repos/ckeditor/workflow-tests-PR-6/actions/runs | jq -c ".workflow_runs | map(.id) | .[]" )

printf "\nDelete all existing actions\n"
for actionId in ${repoActions[@]}
do
  apiUrl="/repos/ckeditor/workflow-tests-PR-6/actions/runs/${actionId}"
  gh api --method DELETE ${apiUrl}
done

printf "\nCommit Files\n"
# Put all files from workflow to testing repo branch directory '.github/workflows`
# https://docs.github.com/en/rest/reference/repos#create-or-update-file-contents

workflowFiles=( ./workflows/*)

for file in ${workflowFiles[@]}
do
    stalebotContent=$( base64 $file )
    apiUrl="/repos/ckeditor/workflow-tests-PR-6/contents/.github/${file:2}"
    echo $apiUrl
    gh api --method PUT $apiUrl -F branch="master" -F message="Update ${file:2} file" -F content="${stalebotContent}"
done

sleep 3

printf "\nGather actions\n"
# Get actions list
actionList=$( gh api /repos/ckeditor/workflow-tests-PR-6/actions/workflows | jq -c ".workflows | map(.id) | .[]" )

echo $actionList

printf "\nDispatach actions\n"
# Dispatach all available workflows
for actionId in ${actionList[@]}
do
    #dispatch workflows
    apiUrl="/repos/ckeditor/workflow-tests-PR-6/actions/workflows/${actionId}/dispatches"
    gh api --method POST -F ref="master" $apiUrl
done

