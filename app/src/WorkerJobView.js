/* eslint-disable react-hooks/exhaustive-deps */
import './App.css';
import React from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import { BrowserRouter as Router, Switch, Route, Link, useParams } from 'react-router-dom';
import MerkleTree, { checkProof, merkleRoot, checkProofSolidityFactory } from 'merkle-tree-solidity';

const { sha3, bufferToHex, toBuffer } = require('ethereumjs-util');

const IPFSHash = require('ipfs-only-hash');
const IPFS = require('ipfs-mini');
const ipfs = new IPFS({ host: 'localhost', port: 5001, protocol: 'http' });

const JobFactoryInterface = require('./interfaces/JobFactory.json');
const JobInterface = require('./interfaces/Job.json');
const config = require('./config.json');
const JobFactoryAddress = config.JobFactory;

function WorkerJobView({ web3, ipfsGateway, account, ipfsApi }) {
	let { jobAddress } = useParams();

	function loadAnswers() {
		try {
			let a = localStorage.getItem(`${jobAddress}/answers`);
			console.log('loading: ', a);
			a = a.split(',');
			return a;
		} catch (error) {
			return [];
		}
	}

	const [jobData, setJobData] = React.useState(null);
	const [batch, setBatch] = React.useState(null);
	const [taskIdxs, setTaskIdxs] = React.useState(null);
	const [tasks, setTasks] = React.useState([]);
	const [classes, setClasses] = React.useState(null);
	const [instructions, setInstructions] = React.useState(null);
	const [currentIdx, setCurrentIdx] = React.useState(null);
	const [answers, setAnswers] = React.useState(loadAnswers());
	console.log('Loaded answers: ', answers);

	const [doneBatch, setDoneBatch] = React.useState(false);
	const [committedAnswers, setCommittedAnswers] = React.useState(false);
	const [selectedReviews, setSelectedReviews] = React.useState(null);

	let Job = new web3.eth.Contract(JobInterface.abi, jobAddress);
	let JobFactory = new web3.eth.Contract(JobFactoryInterface.abi, JobFactoryAddress);

	async function getJobData() {
		let result = await JobFactory.methods.viewJobsData().call({ from: account });
		let data = result.find((x) => x.job == jobAddress);

		console.log('data:', data);
		setJobData(data);
	}

	async function reserveBatch() {
		let result = await Job.methods.reserveBatch().send({ from: account });
	}

	async function getBatch() {
		try {
			let batchData = await Job.methods.getBatch(account).call({ from: account });
			console.log('batch: ', batchData);
			setBatch(batchData);

			let taskIdxs = await Job.methods.getTaskIndexesForAddress(account).call({ from: account });
			console.log(taskIdxs);
			setTaskIdxs(taskIdxs);
			setCurrentIdx(parseInt(taskIdxs.minIndex));
		} catch (err) {
			console.log(err);
			console.log('No batch');
		}
	}

	async function getTaskData() {
		try {
			const url = `${ipfsApi}/ls?arg=${jobData.topLevelCid}`;
			const result = await axios.post(url);
			const dataHash = result.data.Objects[0].Links.find((x) => x.Name === 'data').Hash;

			const classesHash = result.data.Objects[0].Links.find((x) => x.Name === 'classes.json').Hash;
			let classes = await loadIPFSContent(classesHash);
			setClasses(classes);

			const instructionsHash = result.data.Objects[0].Links.find((x) => x.Name === 'instructions.txt').Hash;
			let instructions = await loadIPFSContent(instructionsHash);
			setInstructions(instructions);

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

	React.useEffect(() => {
		async function getBatchAndJobData() {
			await getBatch();
			await getJobData();
		}
		if (account) {
			getBatchAndJobData();
		}
	}, [account]);

	React.useEffect(() => {
		if (batch && jobData) {
			getTaskData();
		}
	}, [batch, jobData]);

	React.useEffect(() => {
		console.log('currentIndex: ', currentIdx);
		if (taskIdxs && currentIdx > taskIdxs.maxIndex) {
			console.log('Done batch');
			setDoneBatch(true);
		}
	}, [currentIdx]);

	function onAnswerTask(answer) {
		console.log('answers.length: ', answers.length);
		let newAnswers = JSON.parse(JSON.stringify(answers));

		if (currentIdx - taskIdxs.minIndex < answers.length) {
			newAnswers[currentIdx - taskIdxs.minIndex] = answer;
		} else {
			newAnswers.push(answer);
		}

		setAnswers(newAnswers);
		setCurrentIdx(currentIdx + 1);
	}

	React.useEffect(() => {
		if (answers && answers.length > 0) {
			console.log('Setting answers: ', answers);
			localStorage.setItem(`${jobAddress}/answers`, answers);
		}
	}, [answers]);

	function renderButtons() {
		return Object.entries(classes).map((kv, index) => {
			const key = kv[0];
			const value = kv[1];
			return (
				<Button onClick={() => onAnswerTask(key)} style={{ margin: 10 }}>
					{value}
				</Button>
			);
		});
	}

	function updateReviews(reviews) {
		console.log('Reviews found: ', reviews);
		if (reviews && reviews.length > 0) {
			let reviewables = reviews.filter((x) => x.returnValues.worker === account);
			if (reviewables && reviewables.length > 0) {
				setSelectedReviews(reviewables[0].returnValues.reviewIndexes);
			}
		}
	}

	React.useEffect(() => {
		Job.events.ReviewsSelected({}, (reviews) => {
			if (reviews) {
				updateReviews(reviews);
			}
		});
	}, []);

	React.useEffect(() => {
		async function getReviews() {
			let reviews = await Job.getPastEvents('ReviewsSelected', {
				fromBlock: 24218905,
				toBlock: 'latest',
				address: jobAddress,
			});
			if (reviews) {
				updateReviews(reviews);
			}
		}
		getReviews();
	}, [account]);

	async function commitAnswers() {
		let answersHash = await IPFSHash.of(answers);
		answersHash = web3.utils.soliditySha3(answersHash);
		console.log('IPFS AnswersHash: ', answersHash);

		const intAnswersHashBytes = answers.map((x) => toBuffer(web3.utils.soliditySha3(parseInt(x))));

		const merkleTree = new MerkleTree(intAnswersHashBytes);
		console.log('merkleTree: ', merkleTree);

		let root = merkleTree.getRoot();
		console.log('Root: ', root);

		const batchindex = parseInt(batch.index);
		console.log('batchindex: ', batchindex);

		let result = await Job.methods.commitAnswers(batchindex, root, answersHash).send({ from: account });
		console.log(result);
		return result;
	}

	async function proveAnswers() {
		try {
			console.log('Submit reviewables');

			const intAnswers = answers.map((x) => parseInt(x));
			const intAnswersHashBytes = intAnswers.map((x) => toBuffer(web3.utils.soliditySha3(x)));

			const merkleTree = new MerkleTree(intAnswersHashBytes);
			console.log('merkleTree: ', merkleTree);

			let root = merkleTree.getRoot();
			console.log('Root: ', root);
			console.log('HexRoot: ', bufferToHex(root));

			let provables = [];

			selectedReviews.forEach((reviewIndex, index) => {
				console.log('idx: ', reviewIndex);
				provables.push(answers[reviewIndex - taskIdxs.minIndex]);
			});

			console.log('Provables: ', provables);
			const proofs = provables.map((x) => merkleTree.getProof(toBuffer(web3.utils.soliditySha3(x))));

			console.log('checkProof: ', checkProof(proofs[0], root, toBuffer(web3.utils.soliditySha3(provables[0]))));
			console.log('args: ', batch.index, provables, proofs);

			let result = await Job.methods.proveAnswers(batch.index, provables, proofs).send({ from: account });
			console.log(result);
			return result;
		} catch (err) {
			console.error(err);
		}
	}

	React.useEffect(() => {
		async function getReviews() {
			let provedAnswers = await Job.getPastEvents('ProvedAnswers', {
				fromBlock: 24219186,
				toBlock: 'latest',
				address: jobAddress,
			});
			console.log('proved answers: ', provedAnswers);
		}
		getReviews();
	}, []);

	async function finalizeSubmission() {
		let answersHash = await IPFSHash.of(answers);
		answersHash = web3.utils.soliditySha3(answersHash);
		console.log('IPFS AnswersHash: ', answersHash);

		const cid = await ipfs.add(answers);

		if (cid) {
			let result = await Job.methods.finalizeSubmission(batch.index, cid).send({ from: account });
			console.log(result);
		}
	}

	if (batch && batch.answersAccepted === true) {
		return (
			<div className="container">
				<div>
					<p>Your answers have been accepted!</p>
				</div>
				<div>
					<Button variant="primary" onClick={() => finalizeSubmission()}>
						Claim Bounty
					</Button>
				</div>
			</div>
		);
	}

	if (
		taskIdxs != null &&
		selectedReviews &&
		selectedReviews.length > 0 &&
		answers.length === taskIdxs.maxIndex - taskIdxs.minIndex + 1
	) {
		return (
			<div className="container">
				<Button variant="primary" onClick={() => proveAnswers()}>
					Submit Reviewables
				</Button>
			</div>
		);
	}

	if (doneBatch && answers) {
		return (
			<div className="container">
				<Button variant="primary" onClick={() => commitAnswers()}>
					Commit Answers
				</Button>
			</div>
		);
	}

	if (jobData && batch && tasks && taskIdxs && taskIdxs.minIndex !== null && currentIdx !== null && classes) {
		return (
			<div className="container">
				<div style={{ margin: 40 }}>
					{jobData.jobName}: Batch #{batch.index}
					<div>
						Task {currentIdx - taskIdxs.minIndex + 1}/{taskIdxs.maxIndex - taskIdxs.minIndex + 1}
					</div>
				</div>
				<div style={{ fontSize: 12 }}>{instructions} </div>
				<div style={{ margin: 40 }}>
					<img src={`${ipfsGateway}/${tasks[currentIdx]}`} width="320" />
				</div>
				<div style={{ margin: 40 }}>{renderButtons()}</div>
			</div>
		);
	}

	if (jobData) {
		return (
			<div className="container">
				{jobData.jobName}
				<div className="row">
					<div className="col-lg">
						{jobData.jobDesc}
						<Button variant="primary" style={{ padding: 20, margin: 40 }} onClick={() => reserveBatch()}>
							Start Batch
						</Button>
					</div>
				</div>
			</div>
		);
	} else {
		return null;
	}
}

export default WorkerJobView;
