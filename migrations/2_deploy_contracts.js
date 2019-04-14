const Splitter = artifacts.require("Splitter");

module.exports = function(deployer) {
  deployer.deploy(Splitter, web3.utils.toBN("2"));
};
