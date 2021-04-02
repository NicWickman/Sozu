// SPDX-License-Identifier: MIT
pragma abicoder v2;
pragma solidity >=0.4.22 <0.9.0;

import "./Job.sol";

contract JobFactory {
    Job[] public jobs;

    function createAndEndow(
        string memory _jobType,
        string memory _jobName,
        string memory _jobDesc,
        uint256 _maxBatchSize,
        uint256 _numTasks
    ) public payable returns (Job) {
        Job job =
            (new Job){value: msg.value}(
                _jobType,
                _jobName,
                _jobDesc,
                _maxBatchSize,
                _numTasks
            );
        jobs.push(job);
        return job;
    }

    function viewJobs() external view returns (Job[] memory) {
        return jobs;
    }
}
