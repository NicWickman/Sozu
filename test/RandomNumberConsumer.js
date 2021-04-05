const truffleAssert = require('truffle-assertions');



contract('RandomNumberConsumer', accounts => {
    const RandomNumberConsumer = artifacts.require('RandomNumberConsumer');
    const VRFCoordinatorMock = artifacts.require('VRFCoordinatorMock');
    const { LinkToken } = require('../node_modules/@chainlink/contracts/truffle/v0.4/LinkToken');
    LinkToken.setProvider(web3.currentProvider)
    const defaultAccount = accounts[0];
    let randomNumberConsumer, vrfCoordinatorMock, seed, link, keyhash, fee;

    describe('#request random number', () => {
        beforeEach(async() => {
            keyhash = '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4'
            fee = '100000000'
            link = await LinkToken.new({ from: defaultAccount })
            seed = 42
            vrfCoordinatorMock = await VRFCoordinatorMock.new(link.address, {from: defaultAccount })
            randomNumberConsumer = await RandomNumberConsumer.new(link.address, keyhash, vrfCoordinatorMock.address, fee, {from: defaultAccount})
        })

        // it('it reverts without LINK', async() => {
        //     await truffleAssert.reverts(randomNumberConsumer.getRandomNumber(seed, { from: defaultAccount }), "revert");
        // })

        it('returns a random number with link', async () => {
            await link.transfer(randomNumberConsumer.address, web3.utils.toWei('1', 'ether'), { from: defaultAccount })
            let transaction = await randomNumberConsumer.getRandomNumber(seed, {from: defaultAccount});

            let requestId = await randomNumberConsumer.lastRequestId({from: defaultAccount})
            await vrfCoordinatorMock.callBackWithRandomness(requestId, '777', randomNumberConsumer.address, {from: defaultAccount})
            let randomNumber = await randomNumberConsumer.randomResult({ from: defaultAccount })
            console.log(randomNumber);
            assert.equal(randomNumber, 777);
        })

    })
})