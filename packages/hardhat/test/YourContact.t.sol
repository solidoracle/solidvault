// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../contracts/YourContract.sol";
import { Vm } from 'forge-std/Vm.sol';

contract YourContractTest is Test {
    YourContract public yourContract;
    address owner = address(0x01);


    function setUp() public {
        yourContract = new YourContract(owner);

    }

    function testGreeting() public {
        assertEq(yourContract.greeting(), "Building Unstoppable Apps!!!");
    }
}


