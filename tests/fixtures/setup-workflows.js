module.exports = [ {
	name: 'setup-workflows direct push',
	workflow: 'setup-workflows.yml',
	branch: 'master',
	config: {
		"setupWorkflows": {
			"pushAsPullRequest": false
		}
	},
	filesList: []
}, {
	name: 'setup-workflows PR',
	workflow: 'setup-workflows.yml',
	branch: 'master',
	config: {
		"setupWorkflows": {
			"pushAsPullRequest": true
		}
	},
	filesList: []
}

];
