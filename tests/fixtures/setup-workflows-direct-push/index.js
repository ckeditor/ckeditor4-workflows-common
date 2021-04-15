module.exports = {
	name: 'setup-workflows direct push',
	workflow: 'setup-workflows.yml',
	branch: 'master',
	filesList: [
		{
			src: 'workflows-config.json',
			dest: '.github/workflows-config.json'
		},
	]
};
