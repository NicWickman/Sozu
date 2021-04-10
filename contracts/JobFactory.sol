// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity >=0.4.22 <0.9.0;

import "./Job.sol";
import {job_interface} from "./interfaces/job_interface.sol";
import "../node_modules/@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";


contract JobFactory is VRFConsumerBase {
    bytes32 internal keyHash;
    uint256 internal fee;

    struct JobData {
        address job;
        address employer;
        string topLevelCid;
        string jobType;
        string jobName;
        string jobDesc;
        uint256 maxBatchSize;
        uint256 numTasks;
        uint8 reviewPct;
    }

    /**
     * Constructor inherits VRFConsumerBase
     * 
     * Network: Kovan
     * Chainlink VRF Coordinator address: 0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9
     * LINK token address:                0xa36085F69e2889c224210F603D836748e7dC0088
     * Key Hash: 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4
     */
    constructor() 
        VRFConsumerBase(
            0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9, // VRF Coordinator
            0xa36085F69e2889c224210F603D836748e7dC0088  // LINK Token
        ) public
    {
        keyHash = 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4;
        fee = 0.1 * 10 ** 18; // 0.1 LINK (varies by network)
    }

    JobData[] public jobsData;

    mapping(bytes32 => address) jobVRFRequests;

    function createAndEndow(
        address address(this),
        address msg.sender,
        string memory _topLevelCid,
        string memory _jobType,
        string memory _jobName,
        string memory _jobDesc,
        uint256 _maxBatchSize,
        uint256 _numTasks,
        uint8 _reviewPct
    ) public payable returns (Job) {
        require(
            _reviewPct <= 100 && _reviewPct > 0,
            "Review pct must be 0 > 100"
        );
        require(
            _maxBatchSize <= _numTasks,
            "Batch size cannot be greater than $ of tasks."
        );

        require(bytes(_topLevelCid).length > 0);
        require(bytes(_jobType).length > 0);
        require(bytes(_jobName).length > 0);
        require(bytes(_jobDesc).length > 0);
        require(
            _maxBatchSize > 0 && _maxBatchSize <= _numTasks,
            "Max batch size must be 0 <= numTasks."
        );
        require(
            _numTasks > 0 && _numTasks >= _maxBatchSize,
            "Total number of tasks must be 0 <= maxBatchSize."
        );

        Job job =
            (new Job){value: msg.value}(
                address(this),
                msg.sender,
                _topLevelCid,
                _jobType,
                _jobName,
                _jobDesc,
                _maxBatchSize,
                _numTasks,
                _reviewPct
            );

        JobData memory jobData = JobData(address(job), msg.sender, _topLevelCid, _jobType, _jobName, _jobDesc, _maxBatchSize, _numTasks, _reviewPct);

        jobsData.push(jobData);

        return job;
    }

    function viewJobsData() external view returns (JobData[] memory) {
        return jobsData;
    }

        /** 
     * Requests randomness from a user-provided seed
     */
    function getRandomNumber(uint256 userProvidedSeed, address _job) public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK");
        bytes32 _requestId = requestRandomness(keyHash, fee, userProvidedSeed);
        jobVRFRequests[_requestId] = _job;
        return _requestId;
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        require(msg.sender == 0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9);
        factory_interface(jobVRFRequests[requestId]).fulfill_random(requestId, randomness);
    }
}
