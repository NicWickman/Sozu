import './App.css';
import React from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import NewJobForm from './NewJobForm';
import JobCard from './JobCard';
import { BrowserRouter as Router, Switch, Route, Link, useParams, useRouteMatch } from 'react-router-dom';
import EmployerJobView from './EmployerJobView';

const JobFactoryInterface = require('./interfaces/JobFactory.json');
const JobInterface = require('./interfaces/Job.json');
const config = require('./config.json');
const JobFactoryAddress = config.JobFactory;

function EmployerHome({ web3, ipfsGateway, ipfsApi, account, jobs }) {
	const [employerJobs, setEmployerJobs] = React.useState([]);

	React.useEffect(() => {
		if (jobs !== null) {
			console.log('Jobs: ', jobs);
			let myEmployerJobs = jobs.filter((x) => x.employer === account);
			setEmployerJobs(myEmployerJobs);
			console.log('Employer jobs: ', myEmployerJobs);
		}
	}, [jobs, account]);

	function renderJobCards(array) {
		return array.map((x) => {
			return <JobCard data={x} web3={web3} key={x.job} />;
		});
	}

	let { jobAddress } = useParams();
	let match = useRouteMatch();

	return (
		<Router>
			<Switch>
				<Route path={`${match.path}/job/:jobAddress`}>
					<EmployerJobView web3={web3} ipfsGateway={ipfsGateway} ipfsApi={ipfsApi} account={account} />
				</Route>
				<Route path="/employer/newjob">
					<div class="container">
						<div class="row">
							<div class="col-lg">
								New Job
								<NewJobForm web3={web3} ipfsGateway={ipfsGateway} ipfsApi={ipfsApi} account={account} />
							</div>
						</div>
					</div>
				</Route>
				<Route path="/employer">
					<div class="container">
						<div class="row">
							<div>
								<div>My Active Jobs</div>
								{renderJobCards(employerJobs)}
							</div>

							<div class="col-sm">
								<Button variant="primary" style={{ padding: 20, margin: 40 }} href="/employer/newjob">
									Create Job
								</Button>
							</div>
						</div>
					</div>
				</Route>
			</Switch>
		</Router>
	);
}

export default EmployerHome;
