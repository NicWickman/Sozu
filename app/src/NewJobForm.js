import './App.css';
import React from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const JobFactoryInterface = require('./interfaces/JobFactory.json');
const JobInterface = require('./interfaces/Job.json');
const config = require('./config.json');
const JobFactoryAddress = config.JobFactory;

function NewJobForm({ web3, ipfsApi, account }) {
	const [reviewPct, setReviewPct] = React.useState(10);
	const [topLevelCid, setTopLevelCid] = React.useState('QmZYxkpQAtKpRdamFzoEzXq8q7Y5oJ6PPXUfoucxfsjNk8');
	const [jobName, setJobName] = React.useState('Imagenette Labelling');
	const [jobType, setJobType] = React.useState('label_images');
	const [jobDesc, setJobDesc] = React.useState(
		'Label images with the correct category to help train our computer vision models.'
	);
	const [maxBatchSize, setMaxBatchSize] = React.useState(10);
	const [jobValue, setJobValue] = React.useState('0.01');

	async function submitJob() {
		let numTasks = await getNumTasks(topLevelCid);

		let JobFactory = new web3.eth.Contract(JobFactoryInterface.abi, JobFactoryAddress);
		console.log(JobFactory);
		let tx = await JobFactory.methods
			.createAndEndow(topLevelCid, jobType, jobName, jobDesc, maxBatchSize, numTasks, reviewPct)
			.send({ from: account, value: web3.utils.toWei(jobValue.toString(), 'ether') });

		console.log(tx);
	}

	async function getNumTasks() {
		const url = `${ipfsApi}/ls?arg=${topLevelCid}`;
		const result = await axios.post(url);
		console.log(result);
		const dataDir = result.data.Objects[0].Links.find((x) => x.Name === 'data').Hash;
		console.log(dataDir);
		const dataUrl = `${ipfsApi}/ls?arg=${dataDir}`;
		const dataResult = await axios.post(dataUrl);
		console.log(dataResult);
		const numTasks = dataResult.data.Objects[0].Links.length;
		console.log(numTasks);
		return numTasks;
	}

	return (
		<Form>
			<Form.Group controlId="ipfsDir">
				<Form.Label>IPFS Directory</Form.Label>
				<Form.Control
					type="text"
					placeholder="QmZYxkpQAtKpRdamFzoEzXq8q7Y5oJ6PPXUfoucxfsjNk8"
					onChange={(event) => setTopLevelCid(event.target.value)}
					value={topLevelCid}
				/>
				<Form.Text className="text-muted">The top-level CID hash containing your job.</Form.Text>
			</Form.Group>

			<Form.Group controlId="jobType">
				<Form.Label>Job Type</Form.Label>
				<Form.Control as="select" onChange={(event) => setJobType(event.target.value)}>
					<option>label_images</option>
				</Form.Control>
				<Form.Text className="text-muted">The interface workers will use to complete your task.</Form.Text>
			</Form.Group>

			<Form.Group controlId="jobName">
				<Form.Label>Job Name</Form.Label>
				<Form.Control
					type="text"
					placeholder="Imagenette Labelling"
					onChange={(event) => setJobName(event.target.value)}
					value={jobName}
				/>
			</Form.Group>

			<Form.Group controlId="jobDescription">
				<Form.Label>Job Description</Form.Label>
				<Form.Control
					type="textarea"
					rows={3}
					placeholder="Label images with the correct category to help train our computer vision models."
					onChange={(event) => setJobDesc(event.target.value)}
					value={jobDesc}
				/>
				<Form.Text className="text-muted">A brief description of your job. Brevity = less gas cost.</Form.Text>
			</Form.Group>

			<Form.Group controlId="formBasicRange">
				<Form.Label>Review Percentage: {reviewPct}</Form.Label>
				<Form.Control
					type="range"
					class="form-range"
					min={0}
					max={100}
					step={1}
					value={reviewPct}
					onChange={(event) => setReviewPct(event.target.value)}
					id="reviewPct"
				/>
			</Form.Group>

			<Form.Group controlId="formBasicRange">
				<Form.Label>Max Batch Size: {maxBatchSize}</Form.Label>
				<Form.Control
					type="range"
					class="form-range"
					min={0}
					max={1000}
					step={10}
					value={maxBatchSize}
					onChange={(event) => setMaxBatchSize(event.target.value)}
					id="maxBatchSize"
				/>
			</Form.Group>

			<Form.Group controlId="jobValue">
				<Form.Label>Endowment</Form.Label>
				<Form.Control
					type="number"
					placeholder={0.1}
					value={jobValue}
					onChange={(event) => setJobValue(event.target.value.toString())}
				></Form.Control>
				<Form.Text className="text-muted">
					The total value (in ETH) for the whole job. Workers will receive a fraction when they complete a
					batch.
				</Form.Text>
			</Form.Group>

			<Button
				variant="primary"
				type="button"
				style={{ padding: 10, marginBottom: 40 }}
				onClick={() => submitJob()}
			>
				Create Job
			</Button>
		</Form>
	);
}

export default NewJobForm;
