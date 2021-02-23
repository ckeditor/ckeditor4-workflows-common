# Assume that testing repo has first "empty" commit
TESTING_REPO="cksource/workflow-tests-PR-6"

# Hardcoded initial empty commit
bSha="ae15364ec3c7cceb7a0624284e4627cc1088ad99"

printf "\nGather running actions\n"

stopVerification=0

function VerifyActions {
	printf "\n RETRY \n"
	#https://docs.github.com/en/rest/reference/actions#list-workflow-runs-for-a-repository
	repoActions=$( gh api /repos/$TESTING_REPO/actions/runs | jq -c ".workflow_runs | map({status: .status, conclusion: .conclusion, id:.id}) | .[]" )


	for action in ${repoActions[@]}
	do

		echo $action[0]
	done

	# Prevents infinite checks...
	stopVerification=$((stopVerification+1))
	if [ $stopVerification == 5 ]; then
		echo "checks reach max"
		exit
	fi

	sleep 5
	VerifyActions
}

VerifyActions 

exit 3;







printf "\nReset master branch to initial commit\n"
gh api --method PATCH -F sha=$bSha -F force="true" /repos/$TESTING_REPO/git/refs/heads/master

printf "\nGather running actions\n"
#https://docs.github.com/en/rest/reference/actions#list-workflow-runs-for-a-repository
repoActions=$( gh api /repos/$TESTING_REPO/actions/runs | jq -c ".workflow_runs | map(.id) | .[]" )

printf "\nDelete all existing actions\n"
for actionId in ${repoActions[@]}
do
  apiUrl="/repos/$TESTING_REPO/actions/runs/${actionId}"
  gh api --method DELETE ${apiUrl}
done

printf "\nCommit Files\n"
# Put all files from workflow to testing repo branch directory '.github/workflows`
# https://docs.github.com/en/rest/reference/repos#create-or-update-file-contents

workflowFiles=( ./workflows/*)

for file in ${workflowFiles[@]}
do
  fileContent=$( base64 $file )
  apiUrl="/repos/$TESTING_REPO/contents/.github/${file:2}"
  echo $apiUrl
  result=$( gh api --method PUT $apiUrl -F branch="master" -F message="Add ${file:2} file" -F content="${fileContent}" | jq -c ".content.name" )
  echo $result
done

FILE=./workflows-config.json
if [ -f "$FILE" ]; then
  printf "\nCommit config\n"
  cfgContent=$( base64 $FILE )
  apiUrl="/repos/$TESTING_REPO/contents/.github/${FILE:2}"
  echo $apiUrl
  result=$( gh api --method PUT $apiUrl -F branch="master" -F message="Add config: $FILE" -F content="${cfgContent}" | jq -c ".content.name" )
  echo $result
fi

printf "\nGather actions...\n"
sleep 3

# Get actions list
actionList=$( gh api /repos/$TESTING_REPO/actions/workflows | jq -c ".workflows | map(.id) | .[]" )

echo $actionList

printf "\nDispatach actions\n"
# Dispatach all available workflows
for actionId in ${actionList[@]}
do
  #dispatch workflows
  apiUrl="/repos/$TESTING_REPO/actions/workflows/${actionId}/dispatches"
  gh api --method POST -F ref="master" $apiUrl
done

echo "Done!"

echo " Please, visit https://github.com/$TESTING_REPO/actions to verify results."