import './App.css';
import React from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import WorkerJobView from './WorkerJobView';
import JobCard from './JobCard';
import { BrowserRouter as Router, Switch, Route, Link, useParams, useRouteMatch } from 'react-router-dom';

const JobFactoryInterface = require('./interfaces/JobFactory.json');
const JobInterface = require('./interfaces/Job.json');
const config = require('./config.json');
const JobFactoryAddress = config.JobFactory;

function WorkerHome({ web3, ipfsGateway, account, jobs, ipfsApi }) {
	function renderJobCards(array) {
		if (jobs !== null) {
			return array.map((x) => {
				return <JobCard data={x} web3={web3} key={x.job} />;
			});
		} else {
			return null;
		}
	}

	let { jobAddress } = useParams();
	let match = useRouteMatch();

	return (
		<Router>
			<Switch>
				<Route path={`${match.path}/job/:jobAddress`}>
					<WorkerJobView web3={web3} ipfsApi={ipfsApi} ipfsGateway={ipfsGateway} account={account} />
				</Route>
				<Route path="/worker">
					<div>Open Jobs</div>
					{renderJobCards(jobs)}
				</Route>
			</Switch>
		</Router>
	);
}

export default WorkerHome;
