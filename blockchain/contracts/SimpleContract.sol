// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "hardhat/console.sol";

contract SimpleContract {
    uint public value;

    constructor(uint _initValue){
        value = _initValue;
    }



    function getValue() public view returns(uint){
        console.log("Getting value");
        return value;
    }

    function setValue(uint _newValue) public {
        console.log("Setting value %o", _newValue);
        value = _newValue;
    }
}
