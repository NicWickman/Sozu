const Migrations = artifacts.require('Migrations');
const JobFactory = artifacts.require('JobFactory');

module.exports = function (deployer) {
	deployer.deploy(Migrations);
	deployer.deploy(JobFactory);
};
