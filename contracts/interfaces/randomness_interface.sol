pragma solidity 0.6.6;

interface randomness_interface {
    function randomNumber(uint) external view returns (uint);
    function getRandomNumber(uint) external returns (bytes32);
}