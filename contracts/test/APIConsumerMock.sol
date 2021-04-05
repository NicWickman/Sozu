pragma solidity >=0.4.22 <0.9.0;

import "../../node_modules/@chainlink/contracts/src/v0.6/ChainlinkClient.sol";

contract APIConsumerMock is ChainlinkClient {
    string public cid;
    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    /**
     * Network: Kovan
     * Oracle: 0x2f90A6D021db21e1B2A077c5a37B3C7E75D15b7e
     * Job ID: 29fa9aa13bf1468788b7cc4a500a45b8
     * Fee: 0.1 LINK
     */
    constructor() public {}

    /**
     * Create a Chainlink request to retrieve API response, find the target
     * data, then multiply by 1000000000000000000 (to remove decimal places from data).
     */
    function requestData(string memory _cid) public returns (string memory) {
        return fulfill(_cid);
    }

    function fulfill(string memory _cid) public returns (string memory) {
        cid = _cid;
        return cid;
    }
}
