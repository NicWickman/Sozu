# Sozu

Mechanical Turk reimagined on the blockchain.

# Description

Sozu is a proof-of-concept which leverages the nature of smart contracts to provide trustless, permissionless paid work to anybody in the world a la Mechanical Turk.
Amazon Mechanical Turk is a crowdsourcing marketplace which allows approved participants to complete tasks in exchange for payment. This accessible form of labour provides income for many thousands of workers, primarily in the United States, but suffers from issues of fairness, trust and transparency. Amazon must approve your participation, the platform is centralized, and workers suffer from power imbalances in the system.

Workers frequently have their work taken for free, as their work is sometimes exposed to the client and then rejected. They can also be rejected on the basis of missing "gold standard" questions, which are often engineered to be answered incorrectly at a higher rate to justify withholding payment.

This project presents a single type of task as a demonstration: Image dataset labelling. To train machine learning algorithms, up to millions of images must be accurately labelled by humans before they can be used. With Sozu, the owner of a dataset can upload their data to IPFS and create a smart contract Job endowed with Ethereum. A worker can reserve a batch of images, label the data, and submit their answers.
We must avoid a few pitfalls to successfully solve the aforementioned problems:

-   The whole work can not be revealed to the client, or else we must trust them to pay.
-   The work which will reviewed cannot be known to the client, or they can stuff those tasks with the work they are actually interested in.
-   The work which will be reviewed cannot be known to the worker, or they can answer only those question correctly and receive payment for the entire batch.
-   Avoid "gold standard" questions if possible.
    
I utilize Chainlink's Verified Random Number Generation in what I believe is a novel method in this domain for fairly verifying the quality of submitted work without compromising it. When a worker has completed labelling the images, they commit to the Job contract a hash of the future IPFS file (determinable beforehand) containing the work and the merkle root of a tree containing their answers. Upon committing the root, Chainlink VRF randomly determines a fraction of the work to be exposed for review, which the worker then submits in plaintext along with a merkle proof that they are the authentic answers which were originally committed. Because neither party can know ahead of time which answers will be chosen, they can not cheat the system through the above methods. Further, the public nature of the blockchain offers total transparency to the nature of the work, the compensation, and the terms of review.

After a batch of answers is accepted, the worker uploads their answers to IPFS and submits the matching hash in order to withdraw payment.
This basic method can be modified to support a large variety of types of work, including transcription, translation, surveys, classification, data verification and more. The ultimate goal is to create a fair, decentralized global marketplace where anybody can provide labour for anybody else.

# Notes

Current status: Submitted for the Chainlink Hackathon. A more complete version of this project would include interaction with IPFS through Chainlink's oracle nodes to confirm that the contents of the submitted answers actually exist on the network, as well as an IPFS node which listens for contract events and pins the finally submitted answer files. The contract is not entirely secure, and I was unable to get a few "requires" working in time, most notably that the finally submitted IPFS file is a match to the promised one.

To be economically sensible, this project would require deployment on a scaling solution such as Polygon or Polkadot.

# How to Run

Due to slow interaction through public IPFS gateways, you will probably require a local IPFS node. I use IPFS Desktop. You must accept GET and POST requests in your IPFS settings and allow cross-origin requests in IPFS and potentially your browser.

#### Install dependencies

```
# project root
npm install

# ./app
yarn install
npx patch-package
```

#### Run app

```
# ./app
yarn start
```

I did not have time to "listen" and update the UI after each transaction in the process. Refresh your browser after your transaction is confirmed. Allow an extra ~30-60 seconds after "committing answers" as a worker to give Chainlink VRF time to generate random numbers.

The JobFactory contract responsible for creating Jobs and fulfilling VRF is deployed to the Kovan testnet at `0x34a7a029b7134B0E8A8b0ebF0ea8016bA1e7a250`.

If you deploy your own JobFactory, update it in `app/src/config.json` and fund it with LINK.
Update your ipfsApi and ipfsGateway host in `app/src/config.json`.

I have prepared an IPFS directory with the required structure at `QmZYxkpQAtKpRdamFzoEzXq8q7Y5oJ6PPXUfoucxfsjNk8`. If you wish to create your own job, pin these contents to your own IPFS node or upload a directory with the following format:

<img src=https://github.com/NicWickman/Sozu/blob/master/images/ipfs_dir.png/>
<img src=https://github.com/NicWickman/Sozu/blob/master/images/classes.png/>
<img src=https://github.com/NicWickman/Sozu/blob/master/images/instructions.png/>

The `Data` directory contains the images to be labelled.

Currently, a worker may only reserve one batch from a job. An employer can also complete one batch of their own job.
