# CKEditor 4 Workflows Common

Shared CKEditor 4 GitHub workflows.

## How it works?

The main function of this repository is to propagate common workflows and keep them up to date.

The `setup-workflows.yml` workflow checkouts this repository once a day in the target repository and updates (or creates) all common workflows. Common workflows are stored in `workflows/` directory here and are copied to `.github/workflows/` directory in a target repository. There is also `setup-workflows.yml` workflow there, which means, once it is set it will auto-update itself too.

## Setup

1. Copy `workflows/setup-workflows.yml` workflow to your repository as `.github/workflows/setup-workflows.yml`.
1. Setup `secrets.GH_BOT_USERNAME` and `secrets.GH_BOT_EMAIL` to GitHub user which has a push access to your repository.
1. Setup `secrets.GH_WORKFLOWS_TOKEN` to GitHub token which has `write` and `workflows` permissions.

## Optional configuration

Some workflows may be altered by configuration options (refer to [Available workflows](#available-workflows) section below). The configuration file is optional and not present by default. If needed, it should be added to any repository using common workflows as `.github/workflows-config.json` file.

### Loading configuration file

For any workflow which needs to load and use configuration values, it is recommended to load config as soon as possible (so right after checkout) using [jq](https://stedolan.github.io/jq/) like:

```yml
- name: Read config
  run: |
    CONFIG='{}'
    if [[ -f "./.github/workflows-config.json" ]]; then
      CONFIG=$( jq -c .setupWorkflows './.github/workflows-config.json' )
    fi
    echo "CONFIG=$CONFIG" >> $GITHUB_ENV
    echo "Workflow config: $CONFIG"
```

Then, further in the workflow any step can use `${{ env.CONFIG }}` variable and read any configuration properties like:

```bash
AS_PR=$(echo '${{ env.CONFIG }}' | jq -r ".pushAsPullRequest")
```

If the workflow can be also triggered manually, it is usually useful to provide a way to use custom config for such runs, for example:

```yml
on:
  workflow_dispatch:
    inputs:
      config:
        description: 'Config'
        required: false
        default: ''

...

- name: Read config
  run: |
    CONFIG='{}'
    if [[ ! -z '${{ github.event.inputs.config }}' ]]; then
      CONFIG='${{ github.event.inputs.config }}'
    elif [[ -f "./.github/workflows-config.json" ]]; then
      CONFIG=$( jq -c .setupWorkflows './.github/workflows-config.json' )
    fi
    echo "CONFIG=$CONFIG" >> $GITHUB_ENV
    echo "Workflow config: $CONFIG"
```

## Available workflows

### setup-workflows

This is the main workflow responsible for propagating all common workflows. When it is added to any other repository it checkouts this repository and copies all common workflows from `workflows/` directory to `.github/workflows/` one. It is run once a day (at 02:00 UTC) so any changes are propagated on a daily basis. See `workflows/setup-workflows.yml` file.

It is a cron job task so will be triggered only on main repository branch.

#### Required secrets

* `GH_WORKFLOWS_TOKEN` - GitHub token which is used for all commit/push/pr actions. It should have write and workflows access.
* `GH_BOT_EMAIL` - GitHub user email which acts as an author of all commits done by this job.
* `GH_BOT_USERNAME` - GitHub user username which acts as an author of all commits done by this job.

#### Optional configuration

* `setupWorkflows.pushAsPullRequest` : `Boolean` If set to true, workflows update will be created as PR instead of being pushed directly to the main branch.

### stalebot

Workflow responsible for handling stale issues and PRs. It is a cron job task so will be triggered only on a main repository branch. See `workflows/stalebot.yml` file.

#### Required secrets

_None_

#### Other requirements

Since this workflow uses labels to mark stale issues/PRs, labels should be already defined in the target repository:

* `stale` - label used to mark stale issues/PRs.
* `status:confirmed` - label used to filter out confirmed issues. Such issues are not processed by `stalebot`.
* `resolution:expired` - label added to stale issues which got closed due to inactivity.
* `pr:frozen ❄` - label added to stale PRs which got closed due to inactivity.

### update-deps

Workflow responsible for updating NPM dependencies. It is run once a week (at 05:00 UTC on Monday) and creates two PRs (if there are any outdated dependencies) - one for dev dependencies and one for production ones. It checks `package.json` file in the repository root and uses `npm-check` to update all dev/prod dependencies (which means `package.json` versioning is not respected). It is a cron job task so will be triggered only on main repository branch. See `workflows/update-deps.yml` file.

#### Required secrets

* `GH_BOT_EMAIL` - GitHub user email which acts as an author of all commits done by this job.
* `GH_BOT_USERNAME` - GitHub user username which acts as an author of all commits done by this job.

#### Optional configuration

* `updateDeps.targetBranch` : `String` Target branch name. By default, workflow runs on main repository branch.

## Testing

### Running tests

To run tests, create `.env` file with the following variables:

* `AUTH_KEY` - GitHub key with permissions to commit files, read and run workflows / actions.
* `OWNER` - Owner of tests repo, e.g. `ckeditor`.
* `REPO` - Tests repo name, e.g. `workflow-tests`.

Then run:

```
npm test
```

### Adding tests

Tests case for new workflows should be added in `tests/fixtures` directory - for example `new-workflow.yml` should by covered with tests from `tests/fixtures/new-workflow.js`. The test file should export array of tests cases (see example below).

New test cases for existing workflows should be added in their test file  in `tests/fixtures` directory with the same name.

All additional files required for tests should be added in `tests/assets` directory.

Each setup has similar structure:
* `name` - Test name which will be displayed in the console when test starts.
* `workflow` - The name of workflow configuration file, ends with the file extension. E.g. 'setup-workflows.yml'. This file will be automatically added to files list.
* `branch` - Branch which should be used to commit files to and verify workflow run.
* `config` - Object with a configuration that will be passed to workflow during dispatching.
* `fileList` - Array of files that will be committed to the specified `branch`.
  * `src` - Path to a source file, related to `assets` directory.
  * `dst` - Path to a destination file in the test repo.

For example:

```js
{
	name: 'setup-workflows direct PR',
	workflow: 'setup-workflows.yml',
	branch: 'master',
	config: {
		'updateDeps': {
			'targetBranch': 'master'
		}
	},
	fileList: [
		{
			src: 'deps-package.json',
			dest: 'package.json'
		}
	]
}
```
