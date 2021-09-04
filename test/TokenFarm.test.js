const DaiToken = artifacts.require('DaiToken')
const DappToken = artifacts.require('DappToken')
const TokenFarm = artifacts.require('TokenFarm')

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n){

    return web3.utils.toWei(n, 'ether')
}

contract('TokenFarm', ([owner, investor]) => {
    let daiToken, dappToken, tokenFarm

    before(async () => {
        daiToken = await DaiToken.new()
        dappToken = await DappToken.new()
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

        await dappToken.transfer(tokenFarm.address, tokens('1000000'))

        await daiToken.transfer(investor, tokens('100', {from: owner}))

    })

    describe('Mock Dai deployment', async() => {

        it('has a name', async () => {
            
            const name = await daiToken.name()
            assert.equal(name, 'Mock DAI Token')
        })
    })

    describe('Dapp deployment', async() => {

        it('has a name', async () => {
            
            const name = await dappToken.name()
            assert.equal(name, 'DApp Token')
        })
    })

    describe('Token Farm deployment', async() => {

        it('has a name', async () => {
            
            const name = await tokenFarm.name()
            assert.equal(name, 'Os Farm Token')
        })

        it('contract has tokens', async () => {
            
            let balance = await dappToken.balanceOf(tokenFarm.address)

            assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    describe('Farming tokens', async () => {
        
        it('reward tokens', async () => {

            let result 
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'correct initial tokens')

            // investor approves and then stakes 100 dai to farm
            await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor })
            await tokenFarm.stakeTokens(tokens('100'), {from: investor})

            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('0'), 'investor balance go down to 0')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('100'), 'farm balance go up to 100')
            
            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('100'), 'investor balance go up to 100')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'true', 'investor is staking')

            result = await tokenFarm.issueTokens({from: owner})

            // investor has 100 tokens
            result = await dappToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor is rewarded dapp token')

            // only owner can call

            await tokenFarm.issueTokens({from: investor}).should.be.rejected;

            // unstake tokens
            await tokenFarm.unstakeTokens({from: investor});

            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor has been refunded')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('0'), 'token farm has 0 left')

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('0'), 'invester has 0 stake')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'false', 'investor is not staking')

            




        })

    })
})