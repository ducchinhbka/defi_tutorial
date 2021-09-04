const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");
const TokenFarm = artifacts.require("TokenFarm");

module.exports = async function(deployer, network, accounts) {
  
    // deploy dai token
    await deployer.deploy(DaiToken)
    const daiToken = await DaiToken.deployed()

    // deploy dapp token
    await deployer.deploy(DappToken)
    const dappToken = await DappToken.deployed()

    // deploy dapp token
    await deployer.deploy(TokenFarm, dappToken.address, daiToken.address)
    const tokenFarm = await TokenFarm.deployed()

    // Transfer all DappToken to TokenFarm(1 million)
    dappToken.transfer(tokenFarm.address, '1000000000000000000000000');

    // Transfer 100 Mock DAI Tokens to investor
    daiToken.transfer(accounts[1], '100000000000000000000');
};
