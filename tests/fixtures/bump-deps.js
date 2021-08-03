module.exports = [
	{
		name: 'update-deps with empty init cfg',
		workflow: 'bump-deps.yml',
		branch: 'master',
		config: {},
		fileList: [ {
			src: 'deps-package-outdated.json',
			dest: 'package.json'
		} ]
	},
	{
		name: 'update-deps with targetBranch in cfg',
		workflow: 'bump-deps.yml',
		branch: 'master',
		config: {
			targetBranch: 'master'
		},
		fileList: [ {
			src: 'deps-package-outdated.json',
			dest: 'package.json'
		} ]
	}
];