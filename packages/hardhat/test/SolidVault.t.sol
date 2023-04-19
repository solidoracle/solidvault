// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../contracts/SolidVault.sol";
import "solmate/src/tokens/WETH.sol";
import { Vm } from 'forge-std/Vm.sol';

contract SolidVaultTest is Test {
    SolidVault public solidVault;
    address owner = address(0x01);
    WETH token = new WETH();
    address aaveLendingPoolAddress = address(0x01); 
    address aaveRewards = address(0x01);
    uint256 targetFloatPercent = 500000000000000000;

    function setUp() public {
        solidVault = new SolidVault(ERC20(token), address(0x01), address(0x01), address(0x01), 500000000000000000);
    }

    function testConstructor() public {
        assertEq(solidVault.owner(), owner);
    }
    
}


