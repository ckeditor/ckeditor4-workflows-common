# CKEditor 4 Workflows Common

Shared CKEditor 4 GitHub workflows.

## How it works?

The main function of `setup-workflows.yml` workflow is to propagate common workflows and keep them up to date.

The `setup-workflows.yml` workflow checkouts this repository once a day in the repository it is executed and updates (or creates) all common workflows. Common workflows are stored in `./workflows/` directory. There is also `setup-workflows.yml` workflow there, which means, once it is set it will auto-update itself too.

## Setup

1. Copy `workflows/setup-workflows.yml` workflow to your repository.
1. Setup `secrets.GH_BOT_USERNAME` and `secrets.GH_BOT_EMAIL` to GitHub user which has a push access to your repository.
1. Setup `secrets.GH_WORKFLOWS_TOKEN` to GitHub token which has `workflows` permission.
