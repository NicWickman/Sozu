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

    address factory_address;

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
        bool proofFailed;
        bool bountyClaimed;
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

    event ReviewsSelected(uint batchIndex, uint256[] reviewIndexes, address worker);
    event ProvedAnswers(address worker, uint256 batchIndex, bool proofAccepted);
    event BountyClaimed(address worker, uint batchIndex);


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

        factory_address = _factory;

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
            batches[msg.sender].answersSubmitted == false,
            "Answers have already been submitted for this batch."
        );

        batches[msg.sender].committedRoot = _root;
        batches[msg.sender].committedAnswersHash = _answersHash;
        batches[msg.sender].answersSubmitted = true;


        randomSelectReview(batches[msg.sender].index);
    }


    function fulfill_random(bytes32 _requestId, uint256 _randomness, uint256 _batchIndex) external returns(uint256) {
        uint256 _thisBatchSize;

        if (_batchIndex == SafeMath.sub(numBatches, 1)) {
            _thisBatchSize = lastBatchSize;
        } else {
            _thisBatchSize = batchSize;
        }


        uint256 numReviews = SafeMath.div(batchSize, reviewPct);
        uint256[] memory _reviewIndexes = new uint256[](numReviews);

        for (uint256 i; i < numReviews; i++) {
            _reviewIndexes[i] = SafeMath.add(
                SafeMath.mul(_batchIndex, batchSize),
                SafeMath.mod(
                    uint256(
                        keccak256(abi.encodePacked(_randomness, nonce))
                    ),
                    _thisBatchSize
                )
            );
            nonce++;
        }

        batches[batchIndex[_batchIndex]].reviewIndexes = _reviewIndexes;
        emit ReviewsSelected(_batchIndex, _reviewIndexes, batchIndex[_batchIndex]);
    }

    function randomSelectReview(uint256 _batchIndex)
        private
    {
        factory_interface(factory_address).getRandomNumber(54389745, address(this), _batchIndex); // Some random Seed
    }


    function proveAnswers(
        uint256 _batchIndex,
        uint256[] calldata _answers,
        bytes32[][] calldata _proofs
    ) external {
        // submit merkle proof of answers
        // submit the future hash of hash of IPFS file
        require(isBatch(batchIndex[_batchIndex]), "Batch index does not exist");
        require(
            batchIndex[_batchIndex] == msg.sender,
            "Batch does not belong to sender"
        );


        bool proofFailed = false;
        for (uint256 i; i < _answers.length; i++){
            bytes32 leaf = keccak256(abi.encodePacked(_answers[i]));
            bool proven = MerkleProof.verify(_proofs[i], batches[batchIndex[_batchIndex]].committedRoot, leaf);
            if (proven == false){
                proofFailed = true;
            }
        }

        if (proofFailed){
            batches[msg.sender].proofFailed = true;
            emit ProvedAnswers(msg.sender, _batchIndex, false);
        } else {
            // We've proven the submitted answers for review match what the worker committed earlier.
            batches[msg.sender].reviewAnswers = _answers;
            batches[msg.sender].proofFailed = false;
            emit ProvedAnswers(msg.sender, _batchIndex, true);
        }

    }

    function acceptAnswers(uint256 _batchIndex) external onlyEmployer {
        require(isBatch(batchIndex[_batchIndex]), "Batch index does not exist");
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

    function finalizeSubmission(uint256 _batchIndex, string calldata _cid)
        external
    {
        require(isBatch(msg.sender), "Batch index does not exist");
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
        // require(
        //     keccak256(abi.encodePacked(_cid)) ==
        //         batches[batchIndex[_batchIndex]].committedAnswersHash,
        //     "Batch finalized answer hash does not match committed answers hash."
        // );

        require(batches[msg.sender].bountyClaimed == false, "Bounty has been already claimed.");

        batches[msg.sender].answersCID = _cid;
        batches[msg.sender].bountyClaimed = true;

        address payable recipient = payable(msg.sender);
        claimBounty(recipient, _batchIndex);
        emit BountyClaimed(msg.sender, _batchIndex);
    }

    bool locked = false;
    function claimBounty(address payable _recipient, uint256 _batchIndex)
        private
    {

        require(!locked, "Reentrant call detected!");
        locked = true;

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

        (bool success, bytes memory transactionBytes) = _recipient.call{value:bounty}("");
        
        require(success, "Transfer failed.");
        locked = false;
    }

    function getTotalBountyPool() public view returns (uint256 totalPool) {
        return totalBountyPool;
    }

    function getTaskBounty() public view returns (uint256 taskBounty) {
        return SafeMath.div(totalBountyPool, numTasks);
    }

    fallback() payable external {}

}