// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity >=0.4.22 <0.9.0;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";
import "../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import "../node_modules/@openzeppelin/contracts/cryptography/MerkleProof.sol";

contract Job is Ownable {
    address employer;
    string topLevelCid;
    string jobType;
    string jobName;
    string jobDesc;
    uint256 batchSize;
    uint256 numTasks;
    uint256 numBatches;
    uint256 lastBatchSize;
    uint256 totalBountyPool;
    uint256 currentBountyPool;
    uint256 nonce;
    uint8 reviewPct;

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
    }

    mapping(address => Batch) batches;
    address[] batchIndex;
    uint256[] rejectedBatchIndexes;

    constructor(
        address _employer,
        string memory _topLevelCid,
        string memory _jobType,
        string memory _jobName,
        string memory _jobDesc,
        uint256 _batchSize,
        uint256 _numTasks,
        uint8 _reviewPct
    ) public payable {
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
        // Add check for rejected batches
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

    function getTaskIndexesForAddress()
        public
        view
        returns (uint256 minIndex, uint256 maxIndex)
    {
        require(isBatch(msg.sender));
        return getTaskIndexesForBatch(batches[msg.sender].index);
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

    function randomSelectReview(uint256 _batchIndex)
        private
        view
        returns (uint256[] memory reviewIndexes)
    {
        // Chainlink VRF randomly select index for proof
        // STUBBED
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
                        keccak256(abi.encodePacked(uint256(76832476), nonce)) // Get this random number from chainlink VFR
                    ),
                    _thisBatchSize
                )
            );
        }

        return _reviewIndexes;
    }

    function proveAnswers(
        uint256 _batchIndex,
        bytes32[] calldata _proof,
        bytes32 _leaf,
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
        require(
            MerkleProof.verify(
                _proof,
                batches[msg.sender].committedRoot,
                _leaf
            ),
            "Merkle proof failed."
        );

        batches[msg.sender].committedAnswersHash = _answersHash;
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

    function finalizeSubmission(uint256 _batchIndex, string calldata _cid)
        external
    {
        // submit IPFS file with the answers that matches pre-submitted hash
        // Get payment
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

    // function getRandomNumbers() private view returns (uint256[] memory) {}
}
