const truffleAssert = require('truffle-assertions');



contract('APIConsumerMock', accounts => {
    const APIConsumerMock = artifacts.require('APIConsumerMock');
    const { LinkToken } = require('../node_modules/@chainlink/contracts/truffle/v0.4/LinkToken');
    LinkToken.setProvider(web3.currentProvider)
    const defaultAccount = accounts[0];
    let APIConsumer, link;

    describe('check cid hash exists', () => {
        beforeEach(async() => {
            link = await LinkToken.new({ from: defaultAccount })
            APIConsumer = await APIConsumerMock.new({from: defaultAccount})
        })

        // it('it reverts without LINK', async() => {
        //     await truffleAssert.reverts(APIConsumer.getRandomNumber(seed, { from: defaultAccount }), "revert");
        // })

        it('Gets a CID', async () => {
            await link.transfer(APIConsumer.address, web3.utils.toWei('2', 'ether'), { from: defaultAccount })
            let transaction = await APIConsumer.requestData('QmZpRvB6io4sZaALCEyjdVesH3YggckdZ1kRpSrFDV5dFf', {from: defaultAccount});
            console.log(transaction)
            let cid = await APIConsumer.cid();
            assert.equal(cid, 'QmZpRvB6io4sZaALCEyjdVesH3YggckdZ1kRpSrFDV5dFf');
        })

    })
})