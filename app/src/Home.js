import './App.css';
import React from 'react';
import Button from 'react-bootstrap/Button';

function Home() {
	return (
		<div className="App">
			<header className="App-header">
				<div class="container">
					<p>
						<Button variant="primary" style={{ padding: 20, margin: 40 }} href="/employer">
							I have work to be completed.
						</Button>
						<Button variant="secondary" style={{ padding: 20, margin: 40 }} href="/worker">
							I want to complete work.
						</Button>
					</p>
				</div>
			</header>
		</div>
	);
}

export default Home;
