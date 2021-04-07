'use strict';

require( './config' )();
const { runTests } = require( './_helpers/test-runner' );

const tests = [
	{
		name: 'setup-workflows.yml',
		branch: 'master',
		filesList: [
			{
				src: 'workflows/setup-workflows.yml',
				dest: '.github/workflows/setup-workflows.yml'
			},
			{
				src: 'workflows-config.json',
				dest: '.github/workflows-config.json'
			},
		]
	},
	{
		name:'update-deps.yml',
		branch: 'master',
		filesList: [
			{
				src: 'workflows/update-deps.yml',
				dest: '.github/workflows/update-deps.yml'
			}
		]
	}
];

runTests( tests );
