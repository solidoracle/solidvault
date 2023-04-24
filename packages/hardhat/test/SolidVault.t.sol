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
        ERC20 asset = solidVault.asset();
        assertEq(address(asset), address(token));
        assertEq(solidVault.owner(), owner);
        assertEq(solidVault.aaveLendingPoolAddress(), aaveLendingPoolAddress);
        assertEq(solidVault.aaveRewards(), aaveRewards);
        assertEq(solidVault.targetFloatPercent(), targetFloatPercent);
    }

    function testDeposit() public {
        // wrap ETH
        token.deposit{value: 1 ether}();
        // approve
        token.approve(address(solidVault), 1 ether);
        // deposit
        console.log(solidVault.deposit(1 ether, address(this)));
        // check balance
        // assertEq(solidVault.totalHoldings(), 1000000000000000000);
        // console.log(solidVault.totalHoldings(), 'total holdings');
        // console.log(solidVault.totalAssets(), 'total assets');

        
    }        
}


