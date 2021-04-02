const Migrations = artifacts.require('Migrations');
const JobFactory = artifacts.require('JobFactory');
const Job = artifacts.require('Job');

import { cids } from "../src/cids.js"

console.log(cids)

module.exports = function (deployer) {
	deployer.deploy(Migrations);
	deployer.deploy(JobFactory);
	deployer.deploy(Job, cids,
		'label_images',
		'Cats vs. Dogs',
		'Earn Ether by helping us identify the difference between cats and dogs.',
		1000,
		10000)
};
