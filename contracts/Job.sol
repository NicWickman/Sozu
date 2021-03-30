// SPDX-License-Identifier: MIT
pragma abicoder v2;
pragma solidity >=0.4.22 <0.9.0;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";

contract Job is Ownable {
    struct Task {
        string cid;
        address worker;
        bool isComplete;
        bool isTask;
    }

    mapping(string => Task) tasks;

    string[] taskList;
    string jobType;
    string jobName;
    string jobDesc;
    uint256 maxBatchSize;
    uint256 bountyPool;

    constructor(
        string[] memory _taskCids,
        string memory _jobType,
        string memory _jobName,
        string memory _jobDesc,
        uint256 _maxBatchSize
    ) payable {
        jobType = _jobType;
        jobName = _jobName;
        jobDesc = _jobDesc;
        maxBatchSize = _maxBatchSize;
        bountyPool = msg.value;

        for (uint256 i; i < _taskCids.length; i++) {
            newTask(_taskCids[i]);
        }
    }

    function isTask(string memory _cid) public view returns (bool isIndeed) {
        return tasks[_cid].isTask;
    }

    function getTaskCount() public view returns (uint256 taskCount) {
        return taskList.length;
    }

    function newTask(string memory _cid)
        private
        onlyOwner
        returns (uint256 rowNumber)
    {
        if (isTask(_cid)) revert("CID is already a task.");
        tasks[_cid].cid = _cid;
        tasks[_cid].isComplete = false;
        tasks[_cid].isTask = true;
        taskList.push(_cid);
        return getTaskCount();
    }

    function getBountyPool() public view returns (uint256 totalPool) {
        return bountyPool;
    }

    function getTaskBounty() public view returns (uint256 taskBounty) {
        return bountyPool / taskList.length;
    }

    function reserveTasks(string[] memory _taskCids)
        external
        returns (string[] memory reservedTasks)
    {
        require(
            0 < _taskCids.length,
            "Reserve a number of tasks greater than 0."
        );

        string[] memory _reservedTasks = new string[](_taskCids.length);

        for (uint256 i; i < _taskCids.length; i++) {
            if (tasks[_taskCids[i]].worker == address(0)) {
                tasks[_taskCids[i]].worker = msg.sender;
                reservedTasks[i] = _taskCids[i];
            }
        }

        return _reservedTasks;
    }

    function getRandomNumbers() private view returns (uint256[] memory) {}
}
