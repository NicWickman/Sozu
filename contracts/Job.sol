// SPDX-License-Identifier: MIT
pragma abicoder v2;
pragma solidity >=0.4.22 <0.9.0;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";
import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../node_modules/@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract Job is Ownable {
    string jobType;
    string jobName;
    string jobDesc;
    uint256 batchSize;
    uint256 numTasks;
    uint256 totalBatches;
    uint256 bountyPool;

    struct Batch {
        bool answersSubmitted;
        bool answersAccepted;
        bytes32 answersHash;
        uint256 reviewIndexes;
        uint256 index;
        string answersCID;
    }

    mapping(address => Batch) private batches;
    address[] private batchIndex;

    constructor(
        string memory _jobType,
        string memory _jobName,
        string memory _jobDesc,
        uint256 _batchSize,
        uint256 _numTasks
    ) payable {
        jobType = _jobType;
        jobName = _jobName;
        jobDesc = _jobDesc;
        batchSize = _batchSize;
        numTasks = _numTasks;
        bountyPool = msg.value;
    }

    function getNumBatches(uint32 _numTasks, uint32 _batchSize)
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
        return (batchIndex[batches[_userAddress].index] == _userAddress);
    }

    function addBatch(address _userAddress) public returns (uint256 index) {
        require(
            !isBatch(_userAddress),
            "Your address is already linked to an active batch."
        );
        batchIndex.push(_userAddress);
        batches[_userAddress].index = batchIndex.length - 1;
        return batchIndex.length - 1;
    }

    function getBatch(address _userAddress) public view returns (Batch memory) {
        require(isBatch(_userAddress), "A batch does not exist for this user.");
        return (batches[_userAddress]);
    }

    function viewBatch() external view returns (Batch memory) {
        return getBatch(msg.sender);
    }

    function reserveBatch() external returns (uint256) {
        require(
            !isBatch(msg.sender),
            "Your address is already linked to an active batch"
        );
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
        return getTaskIndexesForBatch(batches[msg.sender].index);
    }

    function verifyProof(
        bytes32[] memory _proof,
        bytes32 _root,
        bytes32 _leaf
    ) public view returns (bool) {
        return MerkleProof.verify(_proof, _root, _leaf);
    }

    // function getBountyPool() public view returns (uint256 totalPool) {
    //     return bountyPool;
    // }

    // function getTaskBounty() public view returns (uint256 taskBounty) {
    //     return bountyPool / numTasks;
    // }

    // function getRandomNumbers() private view returns (uint256[] memory) {}
}
