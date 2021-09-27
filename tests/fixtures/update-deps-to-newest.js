module.exports = [
	{
		name: 'update-deps with empty init cfg',
		workflow: 'update-deps-to-newest.yml',
		branch: 'master',
		config: {},
		fileList: [ {
			src: 'deps-package-outdated-fixed-version.json',
			dest: 'package.json'
		} ]
	},
	{
		name: 'update-deps with targetBranch in cfg',
		workflow: 'update-deps-to-newest.yml',
		branch: 'master',
		config: {
			targetBranch: 'master'
		},
		fileList: [ {
			src: 'deps-package-outdated-fixed-version.json',
			dest: 'package.json'
		} ]
	},
	{
		name: 'update-deps with bump on false in cfg',
		workflow: 'update-deps-to-newest.yml',
		branch: 'master',
		config: {
			targetBranch: 'master',
			bump: 'false'
		},
		fileList: [ {
			src: 'deps-package-outdated-fixed-version.json',
			dest: 'package.json'
		} ]
	}
];
