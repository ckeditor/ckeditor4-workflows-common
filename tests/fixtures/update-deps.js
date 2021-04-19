module.exports = [ {
	name:'update-deps PR',
	workflow:'update-deps.yml',
	branch: 'master',
	config: {
		'updateDeps': {
			'targetBranch': 'master'
		}
	},
	filesList: [ {
		src: 'deps-package.json',
		dest: 'package.json'
	} ]
} ];
