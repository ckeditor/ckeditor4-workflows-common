module.exports = [ {
		name: 'setup-workflows direct push',
		workflow: 'setup-workflows.yml',
		branch: 'master',
		config: {
			'pushAsPullRequest': 'false'
		}
	}, {
		name: 'setup-workflows direct push (no config)',
		workflow: 'setup-workflows.yml',
		branch: 'master'
	}, {
		name: 'setup-workflows as pull request',
		workflow: 'setup-workflows.yml',
		branch: 'master',
		config: {
			'pushAsPullRequest': 'true'
		}
	}
];
