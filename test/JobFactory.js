const JobFactory = artifacts.require('JobFactory');

const testCids = [
	'QmebgH2vCcLDGQnwp48tSRirpLdGJs3rHtWdW3qyUMxakk',
	'QmZpRvB6io4sZaALCEyjdVesH3YggckdZ1kRpSrFDV5dFf',
	'QmUMWiebt7gsagt49t4R8GXzQVL2YJ67i5SwffQL1pRMJ9',
];

contract('JobFactory', () => {

	it('should create and endow a job', async () => {
		let instance = await JobFactory.deployed();
		try {
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
			
		} catch(e){
			console.error(e)
		}
	});
});
