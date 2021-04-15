'use strict';

require( './config' )();
const { runTests, collectFixtures } = require( './helpers/test-runner' );
const tests = collectFixtures();

runTests( tests );
