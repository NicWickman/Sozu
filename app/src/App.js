import './App.css';
import React from 'react';
import WorkerHome from './WorkerHome';
import EmployerHome from './EmployerHome';
import Home from './Home';

import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

const JobFactoryInterface = require('./interfaces/JobFactory.json');

const config = require('./config.json');
const JobFactoryAddress = config.JobFactory;

const Web3 = require('web3');
const ipfsApi = config.ipfsApi;
const ipfsGateway = config.ipfsGateway;

function App() {
	const [web3, setWeb3] = React.useState(null);
	const [account, setAccount] = React.useState(null);
	const [jobs, setJobs] = React.useState(null);

	React.useEffect(() => {
		async function getJobs() {
			console.log('getting jobs');

			let JobFactory = new web3.eth.Contract(JobFactoryInterface.abi, JobFactoryAddress);
			let allJobs = await JobFactory.methods.viewJobsData().call({ from: account });
			console.log(allJobs);
			setJobs(allJobs);
		}

		if (web3 != null) {
			getJobs();
		}
	}, [web3]);

	React.useEffect(() => {
		async function exposeAccounts() {
			if (window.ethereum != null) {
				setWeb3(new Web3(window.ethereum));
				try {
					await window.ethereum.enable();
					console.log('Accounts now exposed');
				} catch (error) {
					console.warn('User denied account access');
				}
			}
		}
		exposeAccounts();
	}, []);

	React.useEffect(() => {
		async function getAccount() {
			let accounts = await web3.eth.getAccounts();
			console.log(accounts);
			if (accounts.length > 0) {
				setAccount(accounts[0]);
			}
		}
		if (web3) {
			getAccount();
		}
	}, [web3]);

	if (web3) {
		return (
			<div className="App">
				<Router>
					<Switch>
						<Route path="/employer">
							<EmployerHome
								account={account}
								web3={web3}
								ipfsGateway={ipfsGateway}
								ipfsApi={ipfsApi}
								jobs={jobs}
							/>
						</Route>
						<Route path="/worker">
							<WorkerHome
								account={account}
								web3={web3}
								ipfsGateway={ipfsGateway}
								ipfsApi={ipfsApi}
								jobs={jobs}
							/>
						</Route>
						<Route path="/">
							<Home />
						</Route>
					</Switch>
				</Router>
			</div>
		);
	} else {
		return (
			<div className="App">
				<header className="App-header">
					<p>Sign in to a Metamask account to continue.</p>
				</header>
			</div>
		);
	}
}

export default App;
