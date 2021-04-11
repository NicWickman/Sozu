/* eslint-disable react-hooks/exhaustive-deps */
import './App.css';
import React from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

import { BrowserRouter as Router, Switch, Route, Link, useParams, useRouteMatch } from 'react-router-dom';

const JobFactoryInterface = require('./interfaces/JobFactory.json');
const JobInterface = require('./interfaces/Job.json');
const config = require('./config.json');
const JobFactoryAddress = config.JobFactory;

function EmployerReviewView({ web3, ipfsApi, ipfsGateway, account, batches }) {
	let { jobAddress, batchIndex } = useParams();

	let Job = new web3.eth.Contract(JobInterface.abi, jobAddress);
	let JobFactory = new web3.eth.Contract(JobFactoryInterface.abi, JobFactoryAddress);
	const [classes, setClasses] = React.useState(null);
	const [batch, setBatch] = React.useState(null);
	const [tasks, setTasks] = React.useState(null);

	React.useEffect(() => {
		console.log(batches);
		setBatch(batches.find((x) => x.index === batchIndex));
		getTaskData();
	}, []);

	async function getTaskData() {
		try {
			let jobData = await JobFactory.methods.viewJobsData().call({ from: account });
			jobData = jobData.find((x) => x.job === jobAddress);
			const url = `${ipfsApi}/ls?arg=${jobData.topLevelCid}`;
			const result = await axios.post(url);
			const dataHash = result.data.Objects[0].Links.find((x) => x.Name === 'data').Hash;

			const classesHash = result.data.Objects[0].Links.find((x) => x.Name === 'classes.json').Hash;
			let classes = await loadIPFSContent(classesHash);
			setClasses(classes);

			const dataUrl = `${ipfsApi}/ls?arg=${dataHash}`;
			const dataResult = await axios.post(dataUrl);
			const taskObjects = dataResult.data.Objects[0].Links;
			const taskHashes = taskObjects.map((x) => x.Hash);
			setTasks(taskHashes);
			console.log(taskHashes);
		} catch (error) {
			console.error(error);
		}
	}

	async function loadIPFSContent(hash) {
		let result = await axios.post(`${ipfsApi}/cat?arg=${hash}`);
		return result.data;
	}

	let match = useRouteMatch();

	async function acceptBatch() {
		await Job.methods.acceptAnswers(batch.index).send({ from: account });
	}

	async function rejectBatch() {
		await Job.methods.rejectAnswers(batch.index).send({ from: account });
	}

	function renderImageAnswerPairs() {
		return batch.reviewAnswers.map((answer, index) => {
			return (
				<div>
					<div style={{ margin: 40 }}>
						<img src={`${ipfsGateway}/${tasks[batch.reviewIndexes[index]]}`} width="320" />
						<div>{classes[answer]}</div>
					</div>
				</div>
			);
		});
	}

	if (batch && tasks && classes) {
		return (
			<div className="container">
				<div>Accept this batch? </div>
				<div>{renderImageAnswerPairs()}</div>
				<div className="row" style={{ justifyContent: 'center' }}>
					<div style={{ margin: 30 }}>
						<Button variant="secondary" onClick={() => rejectBatch()}>
							Reject
						</Button>
					</div>
					<div style={{ margin: 30 }}>
						<Button variant="primary" onClick={() => acceptBatch()}>
							Accept
						</Button>
					</div>
				</div>
			</div>
		);
	} else {
		return null;
	}
}

export default EmployerReviewView;
