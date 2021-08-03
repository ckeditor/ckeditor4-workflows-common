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
	}
];