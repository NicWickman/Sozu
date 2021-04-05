pragma solidity >=0.4.22 <0.9.0;

import "../node_modules/@chainlink/contracts/src/v0.6/ChainlinkClient.sol";

contract APIConsumer is ChainlinkClient {
    string cid;

    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    /**
     * Network: Kovan
     * Oracle: 0x2f90A6D021db21e1B2A077c5a37B3C7E75D15b7e
     * Job ID: 29fa9aa13bf1468788b7cc4a500a45b8
     * Fee: 0.1 LINK
     */
    constructor() public {
        setPublicChainlinkToken();
        oracle = 0x2f90A6D021db21e1B2A077c5a37B3C7E75D15b7e;
        jobId = "29fa9aa13bf1468788b7cc4a500a45b8";
        fee = 0.1 * 10**18; // 0.1 LINK
    }

    /**
     * Create a Chainlink request to retrieve API response, find the target
     * data, then multiply by 1000000000000000000 (to remove decimal places from data).
     */
    function requestData(string memory _cid)
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

        request.add("path", "Objects[0].Hash");

        // Sends the request
        return sendChainlinkRequestTo(oracle, request, fee);
    }

    function fulfill(bytes32 _requestId, string memory _cid)
        public
        recordChainlinkFulfillment(_requestId)
    {
        cid = _cid;
    }
}
