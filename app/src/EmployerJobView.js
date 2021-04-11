/* eslint-disable react-hooks/exhaustive-deps */
import './App.css';
import React from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import EmployerReviewView from './EmployerReviewView';
import { BrowserRouter as Router, Switch, Route, Link, useParams, useRouteMatch } from 'react-router-dom';

const JobFactoryInterface = require('./interfaces/JobFactory.json');
const JobInterface = require('./interfaces/Job.json');
const config = require('./config.json');
const JobFactoryAddress = config.JobFactory;

function EmployerJobView({ web3, ipfsGateway, ipfsApi, account }) {
	let { jobAddress, batchIndex } = useParams();

	let Job = new web3.eth.Contract(JobInterface.abi, jobAddress);
	let JobFactory = new web3.eth.Contract(JobFactoryInterface.abi, JobFactoryAddress);
	const [reviewableBatches, setReviewableBatches] = React.useState(null);

	React.useEffect(() => {
		async function getReviewableBatches() {
			let reviews = await Job.getPastEvents('ProvedAnswers', {
				fromBlock: 24219186,
				toBlock: 'latest',
				address: jobAddress,
			});

			console.log('reviews: ', reviews);
			const eventsForReview = reviews.filter((x) => x.returnValues.proofAccepted === true);
			const reviewableWorkers = eventsForReview.map((x) => x.returnValues.worker);
			let batchesForReview = [];

			await Promise.all(
				reviewableWorkers.map(async (address) => {
					const batch = await Job.methods.getBatch(address).call({ from: account });
					batchesForReview.push(batch);
				})
			);

			console.log('Batches for review: ', batchesForReview);
			setReviewableBatches(batchesForReview);
		}
		getReviewableBatches();
	}, []);

	let match = useRouteMatch();

	function renderBatchCards(reviewableBatches) {
		return reviewableBatches.map((batch) => {
			return (
				<Card key={batch.index} style={{ width: '18rem' }} bg="secondary">
					{/* <Card.Img variant="top" src="holder.js/100px180" /> */}
					<Card.Body>
						<Card.Title>Batch Index: {batch.index}</Card.Title>
						<Card.Text style={{ fontSize: 14 }}># of reviews: {batch.reviewAnswers.length}</Card.Text>
						<Button variant="primary" href={`${match.url}/batch/${batch.index}`}>
							Review Batch
						</Button>
					</Card.Body>
				</Card>
			);
		});
	}

	if (reviewableBatches) {
		return (
			<Router>
				<Switch>
					<Route path={`${match.path}/batch/:batchIndex`}>
						<EmployerReviewView
							web3={web3}
							ipfsGateway={ipfsGateway}
							account={account}
							batches={reviewableBatches}
							ipfsApi={ipfsApi}
						/>
					</Route>
					<Route path={`${match.path}`}>
						<div>{renderBatchCards(reviewableBatches)}</div>
					</Route>
				</Switch>
			</Router>
		);
	} else {
		return null;
	}
}

export default EmployerJobView;
