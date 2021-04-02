const Job = artifacts.require('Job');
import { cids } from "../src/cids.js"



contract('Job', () => {
	it('should allow reserving a job', async () => {
		// try {
			let instance = await Job.deployed();
			let reservedBatch = await instance.reserveBatch()
			console.log(reservedBatch);


		// } catch (e){
		// 	console.error(e)
		// }

	});
});
