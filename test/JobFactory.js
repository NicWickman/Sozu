const JobFactory = artifacts.require('JobFactory');
import { cids } from "../src/cids.js"

// console.log(cids)

let testCids = [];

cids.forEach((cid, i) => {
	if (i < 25){
		testCids.push(cid)
	}
})

contract('JobFactory', () => {
	it('should create and endow a job', async () => {
		try {
			let instance = await JobFactory.deployed();
			let jobAddress = await instance.createAndEndow.call(testCids,
				'label_images',
				'Cats vs. Dogs',
				'Earn Ether by helping us identify the difference between cats and dogs.',
				1000)
			
			let results = await instance.createAndEndow(
				testCids,
				'label_images',
				'Cats vs. Dogs',
				'Earn Ether by helping us identify the difference between cats and dogs.',
				1000,
				{ value: web3.utils.toWei('1', 'ether') }
			);
	
			let jobValue = await web3.eth.getBalance(jobAddress);
			assert.equal(jobValue, '1000000000000000000', "Contract does not have the correct balance in the pool.")

			console.log(results)

		} catch (e){
			console.error(e)
		}

	});
});
