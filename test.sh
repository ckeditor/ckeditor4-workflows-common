#create empty repo
#add selected files to .github/workflows & add settings if provided
#via gh api - run workflow & watch results

# https://stedolan.github.io/jq/download/
#gh api /repos/ckeditor/workflow-tests-PR-6/actions/workflows | jq -c ".workflows | map({ name: .name, id: .id }) | .[]"

gh api --method POST -F ref="master" /repos/ckeditor/workflow-tests-PR-6/actions/workflows/5661822/dispatches