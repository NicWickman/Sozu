// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity >=0.4.22 <0.9.0;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";
import "../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import "../node_modules/@openzeppelin/contracts/cryptography/MerkleProof.sol";
import "../node_modules/@chainlink/contracts/src/v0.6/ChainlinkClient.sol";
import {factory_interface} from "./interfaces/factory_interface.sol";


contract Job is Ownable, ChainlinkClient {
    address private oracle;
    bytes32 private jobId;
    uint256 private fee;
    factory_interface public factory;

    address public employer;
    string public topLevelCid;
    string public jobType;
    string public jobName;
    string public jobDesc;
    uint256 public batchSize;
    uint256 public numTasks;
    uint256 public numBatches;
    uint256 public lastBatchSize;
    uint256 public totalBountyPool;
    uint256 public currentBountyPool;
    uint256 nonce;
    uint8 public reviewPct;

    uint256 randomNumber;

    mapping(bytes32 => uint256) randomNumbers;
    mapping(bytes32 => string) returnedCids;


    struct Batch {
        bool isBatch;
        bool answersSubmitted;
        bool answersAccepted;
        bool answersRejected;
        bytes32 committedRoot;
        bytes32 committedAnswersHash;
        uint256[] reviewIndexes;
        uint256 index;
        string answersCID;
        uint256[] reviewAnswers;
    }

    mapping(address => Batch) batches;
    address[] batchIndex;
    uint256[] rejectedBatchIndexes;


    /**
     * Network: Kovan
     * Oracle: 0x2f90A6D021db21e1B2A077c5a37B3C7E75D15b7e
     * Job ID: 29fa9aa13bf1468788b7cc4a500a45b8
     * Fee: 0.1 LINK
     */

    constructor(
        address _factory,
        address _employer,
        string memory _topLevelCid,
        string memory _jobType,
        string memory _jobName,
        string memory _jobDesc,
        uint256 _batchSize,
        uint256 _numTasks,
        uint8 _reviewPct
    ) public payable {
        setPublicChainlinkToken();
        oracle = 0x2f90A6D021db21e1B2A077c5a37B3C7E75D15b7e;
        jobId = "29fa9aa13bf1468788b7cc4a500a45b8";
        fee = 0.1 * 10**18; // 0.1 LINK
        factory = factory_interface(_factory);

        employer = _employer;
        topLevelCid = _topLevelCid;
        jobType = _jobType;
        jobName = _jobName;
        jobDesc = _jobDesc;
        batchSize = _batchSize;
        numTasks = _numTasks;
        reviewPct = _reviewPct;
        numBatches = getNumBatches(_numTasks, _batchSize);
        lastBatchSize = SafeMath.mod(
            numTasks,
            SafeMath.mul(batchSize, numBatches)
        );
        totalBountyPool = msg.value;
        currentBountyPool = msg.value;
    }

    modifier onlyEmployer {
        require(
            msg.sender == employer,
            "Only the owner of this job can call this function."
        );
        _;
    }

    function getNumBatches(uint256 _numTasks, uint256 _batchSize)
        public
        pure
        returns (uint256)
    {
        if (SafeMath.mod(_numTasks, _batchSize) == 0) {
            return SafeMath.div(_numTasks, _batchSize);
        } else {
            return SafeMath.add(1, SafeMath.div(_numTasks, _batchSize));
        }
    }

    function isBatch(address _userAddress) public view returns (bool isIndeed) {
        if (batchIndex.length == 0) return false;
        return (batchIndex[batches[_userAddress].index] == _userAddress &&
            batches[_userAddress].isBatch == true);
    }

    function addBatch(address _userAddress) private returns (uint256 index) {
        require(
            !isBatch(_userAddress),
            "Your address is already linked to an active batch."
        );
        batchIndex.push(_userAddress);
        batches[_userAddress].index = batchIndex.length - 1;
        batches[_userAddress].isBatch = true;
        return batchIndex.length - 1;
    }

    function getBatch(address _userAddress) public view returns (Batch memory) {
        require(isBatch(_userAddress), "A batch does not exist for this user.");
        return (batches[_userAddress]);
    }

    function viewBatch() public view returns (Batch memory) {
        return getBatch(msg.sender);
    }

    function reserveBatch() external returns (uint256) {
        require(batchIndex.length < numBatches, "All the batches for this Job have been claimed.");
        return addBatch(msg.sender);
    }

    function getTaskIndexesForBatch(uint256 _batchIdx)
        public
        view
        returns (uint256 minIndex, uint256 maxIndex)
    {
        uint256 minIdx = SafeMath.mul(_batchIdx, batchSize);
        uint256 maxIdx = SafeMath.sub(SafeMath.add(minIdx, batchSize), 1);
        return (minIdx, maxIdx);
    }

    function getTaskIndexesForAddress(address _address)
        public
        view
        returns (uint256 minIndex, uint256 maxIndex)
    {
        require(isBatch(msg.sender));
        return getTaskIndexesForBatch(batches[_address].index);
    }

    function verifyProof(
        bytes32[] memory _proof,
        bytes32 _root,
        bytes32 _leaf
    ) private pure returns (bool) {
        return MerkleProof.verify(_proof, _root, _leaf);
    }

    function commitAnswers(
        uint256 _batchIndex,
        bytes32 _root,
        bytes32 _answersHash
    ) external {
        // Commit to a merkle root for batch of answers
        require(
            isBatch(msg.sender),
            "This account does not have a batch reserved."
        );
        require(
            batchIndex[_batchIndex] == msg.sender,
            "Batch does not belong to sender"
        );
        require(
            batches[msg.sender].answersSubmitted = false,
            "Answers have already been submitted for this batch."
        );

        batches[msg.sender].committedRoot = _root;
        batches[msg.sender].committedAnswersHash = _answersHash;
        uint256[] memory reviewIndexes =
            randomSelectReview(batches[msg.sender].index);
        batches[msg.sender].reviewIndexes = reviewIndexes;
    }

    function fulfill_random(bytes32 requestId, uint256 randomness) external returns(uint256) {
        randomNumber = randomness;
        return randomness;
    }

    function randomSelectReview(uint256 _batchIndex)
        private
        returns (uint256[] memory reviewIndexes)
    {
        factory_interface(factory.factory()).getRandomNumber(54389745, address(this)); // Some random Seed

        uint256 _thisBatchSize;
        if (_batchIndex == SafeMath.sub(numBatches, 1)) {
            _thisBatchSize = lastBatchSize;
        } else {
            _thisBatchSize = batchSize;
        }
        uint256 numReviews = SafeMath.mul(reviewPct, batchSize);

        uint256[] memory _reviewIndexes = new uint256[](numReviews);

        for (uint256 i; i < numReviews; i++) {
            _reviewIndexes[i] = SafeMath.add(
                SafeMath.mul(_batchIndex, _thisBatchSize),
                SafeMath.mod(
                    uint256(
                        keccak256(abi.encodePacked(randomNumber, nonce))
                    ),
                    _thisBatchSize
                )
            );
        }

        return _reviewIndexes;
    }

    function proveAnswers(
        uint256 _batchIndex,
        uint256[] calldata _answers,
        bytes32[] calldata _proof,
        bytes32 _answersHash
    ) external {
        // submit merkle proof of answers
        // submit the future hash of hash of IPFS file
        require(isBatch(batchIndex[_batchIndex]), "Batch index does not exist");
        require(
            batchIndex[_batchIndex] == msg.sender,
            "Batch does not belong to sender"
        );
        require(
            batches[batchIndex[_batchIndex]].answersSubmitted == true,
            "Batch has not had answers submitted."
        );

        // Construct leaves internally with returned CIDs from Chainlink to verify the proof.
        (uint256 indexMin, uint256 indexMax) = getTaskIndexesForAddress(msg.sender);
        
        bytes32[] memory leaves = new bytes32[](_answers.length);
        uint256 answersIndex = 0;
        for (uint i = indexMin; i <= indexMax; i++){
            bytes32 requestId = requestIndexCID(topLevelCid, i);
            string memory returnedCid = returnedCids[requestId];
            bytes32 leaf = keccak256(abi.encode(i, returnedCid, _answers[answersIndex]));
            leaves[answersIndex] = leaf;
            answersIndex++;
        }

        for (uint i; i < leaves.length; i++){
        require(
            MerkleProof.verify(
                _proof,
                batches[msg.sender].committedRoot,
                leaves[i]
            ),
            "Merkle proof failed."
        );
        }

        // We've proven the submitted answers for review match what the worker committed earlier.
        batches[msg.sender].committedAnswersHash = _answersHash;
        batches[msg.sender].reviewAnswers = _answers;

    }

    function acceptAnswers(uint256 _batchIndex) external onlyEmployer {
        require(isBatch(batchIndex[_batchIndex]), "Batch index does not exist");
        require(
            batchIndex[_batchIndex] == msg.sender,
            "Batch does not belong to sender"
        );
        require(
            batches[batchIndex[_batchIndex]].answersSubmitted == true,
            "Batch has not had answers submitted."
        );
        batches[batchIndex[_batchIndex]].answersAccepted = true;
    }

    function rejectAnswers(uint256 _batchIndex) external onlyEmployer {
        require(isBatch(batchIndex[_batchIndex]), "Batch index does not exist");
        require(
            batches[batchIndex[_batchIndex]].answersSubmitted == true,
            "Batch has not had answers submitted."
        );
        batches[batchIndex[_batchIndex]].answersRejected = true;
        batches[batchIndex[_batchIndex]].isBatch = false;
    }

    function fulfill(bytes32 _requestId, string memory _cid) public
        recordChainlinkFulfillment(_requestId){
        returnedCids[_requestId] = _cid;
    }

    function finalizeSubmission(uint256 _batchIndex, string calldata _cid)
        external
    {
        require(isBatch(batchIndex[_batchIndex]), "Batch index does not exist");
        require(
            batchIndex[_batchIndex] == msg.sender,
            "Batch does not belong to sender"
        );
        require(
            batches[batchIndex[_batchIndex]].answersSubmitted == true,
            "Batch has not had answers submitted."
        );
        require(
            batches[batchIndex[_batchIndex]].answersAccepted == true,
            "Batch has not had answers accepted."
        );
        require(
            keccak256(abi.encode(_cid)) ==
                batches[batchIndex[_batchIndex]].committedAnswersHash,
            "Batch finalized answer hash does not match committed answers hash."
        );

        // Chainlink APIConsumer Call to confirm the IPFS file exists
        bytes32 requestId = requestCID(_cid);
        require(keccak256(abi.encode(returnedCids[requestId])) == keccak256(abi.encode(_cid)), "Hash of submitted cid does not match committed answers hash.");

        batches[msg.sender].answersCID = _cid;
        claimBounty(msg.sender, _batchIndex);
    }

    function claimBounty(address payable _recipient, uint256 _batchIndex)
        private
    {
        uint256 _thisBatchSize;
        if (_batchIndex == SafeMath.sub(numBatches, 1)) {
            _thisBatchSize = lastBatchSize;
        } else {
            _thisBatchSize = batchSize;
        }

        uint256 bounty = SafeMath.mul(getTaskBounty(), _thisBatchSize);

        require(
            address(this).balance >= bounty,
            "Contract does not have enough funds."
        );
        _recipient.transfer(bounty);
    }

    function getTotalBountyPool() public view returns (uint256 totalPool) {
        return totalBountyPool;
    }

    function getTaskBounty() public view returns (uint256 taskBounty) {
        return totalBountyPool / numTasks;
    }


    /**
     * Create a Chainlink request to retrieve API response, find the target
     */
    function requestCID(string memory _cid)
        public
        returns (bytes32 requestId)
    {
        Chainlink.Request memory request =
            buildChainlinkRequest(jobId, address(this), this.fulfill.selector);

        // Set the URL to perform the GET request on
        request.add(
            "get",
            string(abi.encode("http://ipfs.io/api/v0/ls?arg=", _cid))
        );

        request.add("path", "Objects.0.Hash");

        // Sends the request
        return sendChainlinkRequestTo(oracle, request, fee);
    }

    function requestIndexCID(string memory _cid, uint256 _idx)
        public
        returns (bytes32 requestId)
    {
        Chainlink.Request memory request =
            buildChainlinkRequest(jobId, address(this), this.fulfill.selector);

        // Set the URL to perform the GET request on
        request.add(
            "get",
            string(abi.encode("http://ipfs.io/api/v0/ls?arg=", _cid))
        );

        request.add("path", string(abi.encode("Objects.0.Links.", _idx, ".Hash")));

        // Sends the request
        return sendChainlinkRequestTo(oracle, request, fee);
    }

}
