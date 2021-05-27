module.exports = [
	{
		name: 'update-deps branch without package.json file',
		workflow: 'update-deps.yml',
		branch: 'master',
		config: {
			'updateDeps': {
				'targetBranch': 'master'
			}
		}
	}, {
		name: 'update-deps on up-to-date branch',
		workflow: 'update-deps.yml',
		branch: 'master',
		config: {
			'updateDeps': {
				'targetBranch': 'master'
			}
		},
		fileList: [ {
			src: 'deps-package-up-to-date.json',
			dest: 'package.json'
		} ]
	}, {
		name: 'update-deps PR',
		workflow: 'update-deps.yml',
		branch: 'master',
		config: {
			'updateDeps': {
				'targetBranch': 'master'
			}
		},
		fileList: [ {
			src: 'deps-package-outdated.json',
			dest: 'package.json'
		} ]
	}, {
		name: 'update-deps on non-existing branch',
		workflow: 'update-deps.yml',
		branch: 'master',
		config: {
			'updateDeps': {
				'targetBranch': 'main'
			}
		},
		fileList: [ {
			src: 'deps-package-outdated.json',
			dest: 'package.json'
		} ]
	}
];
