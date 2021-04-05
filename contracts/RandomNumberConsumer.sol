pragma solidity >=0.4.22 <0.9.0;

import "../node_modules/@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";

contract RandomNumberConsumer is VRFConsumerBase {
    bytes32 internal keyHash;
    uint256 internal fee;
    uint256 public randomResult;
    bytes32 public lastRequestId;

    /**
     * Constructor inherits VRFConsumerBase
     *
     * Network: Kovan
     * Chainlink VRF Coordinator address: 0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9
     * LINK token address:                0xa36085F69e2889c224210F603D836748e7dC0088
     * Key Hash: 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4
     */
    constructor(
        address _linkTokenAddress,
        bytes32 _keyHash,
        address _vrfCoordinatorAddress,
        uint256 _fee
    )
        public
        VRFConsumerBase(
            _vrfCoordinatorAddress, // VRF Coordinator
            _linkTokenAddress // LINK Token
        )
    {
        keyHash = _keyHash;
        fee = _fee;
        //  0.1 * 10**18 // 0.1 LINK (varies by network)
    }

    event randomNumberEmitted(uint256 randomness);

    /**
     * Requests randomness from a user-provided seed
     */
    function getRandomNumber(uint256 userProvidedSeed)
        public
        returns (bytes32 requestId)
    {
        require(
            LINK.balanceOf(address(this)) >= fee,
            "Not enough LINK - fill contract with faucet"
        ); // Disabled for testing
        lastRequestId = requestRandomness(keyHash, fee, userProvidedSeed);
        return requestRandomness(keyHash, fee, userProvidedSeed);
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        randomResult = randomness;
        emit randomNumberEmitted(randomness);
    }
}
