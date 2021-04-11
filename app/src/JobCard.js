import './App.css';
import React from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

import { BrowserRouter as Router, Switch, Route, Link, useRouteMatch, useParams } from 'react-router-dom';

function JobCard({ data, web3 }) {
	const [balance, setBalance] = React.useState('Fetching...');

	React.useEffect(() => {
		async function getBalance() {
			console.log(data.job);
			let b = await web3.eth.getBalance(data.job, 'latest');
			let etherPool = web3.utils.fromWei(b, 'ether');
			let batchValue = etherPool / data.numTasks;
			setBalance(batchValue);
		}
		getBalance();
	}, []);

	let match = useRouteMatch();

	return (
		<Card style={{ width: '18rem', margin: 20 }} bg="secondary">
			<Card.Body>
				<Card.Title>{data.jobName}</Card.Title>
				<Card.Text style={{ fontSize: 14 }}>{data.jobDesc}</Card.Text>
				<Card.Text style={{ fontSize: 14 }}>Batch size: {data.maxBatchSize}</Card.Text>
				<Card.Text style={{ fontSize: 14 }}>Task value: {balance} ETH</Card.Text>
				<Button variant="primary" href={`${match.url}/job/${data.job}`}>
					View Job
				</Button>
			</Card.Body>
		</Card>
	);
}

export default JobCard;
