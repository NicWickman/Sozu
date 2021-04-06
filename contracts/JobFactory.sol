// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Job.sol";

contract JobFactory {
    Job[] public jobs;

    event JobPublished(address publisher, address job);

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
            _reviewPct <= 100 && _reviewPct > 0,
            "Review percentage must be greater than 0 and less than or equal to 100"
        );
        require(
            _maxBatchSize <= _numTasks,
            "Batch size cannot be greater than the number of tasks."
        );

        require(bytes(_topLevelCid).length > 0, "Please provide all fields.");
        require(bytes(_jobType).length > 0, "Please provide all fields.");
        require(bytes(_jobName).length > 0, "Please provide all fields.");
        require(bytes(_jobDesc).length > 0, "Please provide all fields.");
        require(
            _maxBatchSize > 0 && _maxBatchSize <= _numTasks,
            "Max batch size must be greater than zero and less than or equal to the total number of tasks."
        );
        require(
            _numTasks > 0 && _numTasks >= _maxBatchSize,
            "Total number of tasks must be greater than zero and greater than or equal to the max batch size."
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

        emit JobPublished(msg.sender, address(job));
        return job;
    }

    function viewJobs() external view returns (Job[] memory) {
        return jobs;
    }
}
