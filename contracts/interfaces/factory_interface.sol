pragma solidity ^0.6.6;

interface factory_interface {
    function factory() external view returns (address);
    function randomness() external view returns (address);
    function fulfill_random(bytes32, uint) external;
    function getRandomNumber(uint, address) external;
}