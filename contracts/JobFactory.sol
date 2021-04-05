// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Job.sol";

contract JobFactory {
    Job[] public jobs;

    function createAndEndow(
        string memory _topLevelCid,
        string memory _jobType,
        string memory _jobName,
        string memory _jobDesc,
        uint256 _maxBatchSize,
        uint256 _numTasks,
        uint8 _reviewPct
    ) public payable returns (Job) {
        require(
            _reviewPct <= 100,
            "Review percentage must be less than or equal to 100"
        );
        require(
            _maxBatchSize <= _numTasks,
            "Batch size cannot be greater than the number of tasks."
        );

        Job job =
            (new Job){value: msg.value}(
                msg.sender,
                _topLevelCid,
                _jobType,
                _jobName,
                _jobDesc,
                _maxBatchSize,
                _numTasks,
                _reviewPct
            );
        jobs.push(job);
        return job;
    }

    function viewJobs() external view returns (Job[] memory) {
        return jobs;
    }
}
