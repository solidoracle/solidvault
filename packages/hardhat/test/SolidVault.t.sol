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
    address aaveLendingPoolAddress = address(0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2); 
    address aaveRewards = address(0x8164Cc65827dcFe994AB23944CBC90e0aa80bFcb);
    uint256 targetFloatPercent = 1e17; // 10%

    function setUp() public {
        solidVault = new SolidVault(ERC20(token), owner, aaveLendingPoolAddress, aaveRewards, targetFloatPercent);
    }

    function testConstructor() public {
        assertEq(solidVault.owner(), owner);
        assertEq(solidVault.aaveLendingPoolAddress(), aaveLendingPoolAddress);
        assertEq(solidVault.aaveRewards(), aaveRewards);
        assertEq(solidVault.targetFloatPercent(), targetFloatPercent);
    }

    // deal owner some tokens and test deposit
    function testDeposit() public {
        token.deposit{value: 1000000000000000000}();
        token.transfer(address(solidVault), 1000000000000000000);
        assertEq(token.balanceOf(address(solidVault)), 1000000000000000000);
        assertEq(solidVault.balanceOf(address(solidVault)), 0);
        assertEq(solidVault.totalSupply(), 0);
        assertEq(solidVault.totalAssets(), 1000000000000000000);
    }        
}


