let date = new Date();
let testNpmCheck = true;
let npmCheckDay = testNpmCheck ? date.getDate() : date.getDate() + 1;

module.exports = [
	{
		name: 'update-deps branch without package.json file',
		workflow: 'update-deps.yml',
		branch: 'master',
		config: {
			'targetBranch': 'master'
		}
	}, {
		name: 'update-deps on up-to-date branch',
		workflow: 'update-deps.yml',
		branch: 'master',
		config: {
			'targetBranch': 'master'
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
			'targetBranch': 'master'
		},
		fileList: [ {
			src: 'deps-package-outdated.json',
			dest: 'package.json'
		} ]
	}, {
		name: 'update-deps with npm-check on custom day of month',
		workflow: 'update-deps.yml',
		branch: 'master',
		config: {
			'npmCheckDay': npmCheckDay
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
			'targetBranch': 'main'
		},
		fileList: [ {
			src: 'deps-package-outdated.json',
			dest: 'package.json'
		} ]
	}
];
