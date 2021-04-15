module.exports = {
	name:'update-deps PR',
	workflow:'update-deps.yml',
	branch: 'master',
	filesList: [
		{
			src: 'workflows-config.json',
			dest: '.github/workflows-config.json'
		},
	]
};
