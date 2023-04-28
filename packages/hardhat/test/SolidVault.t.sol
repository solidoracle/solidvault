// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../contracts/SolidVault.sol";
import "solmate/src/tokens/WETH.sol";
import { Vm } from 'forge-std/Vm.sol';
import  { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import "../contracts/Interfaces/aave/IPool.sol";

interface WETHInterface is IERC20 {
    function deposit() external payable;
    function withdraw(uint256 wad) external;
}


contract SolidVaultTest is Test {
    SolidVault public solidVault;
    address owner = address(0x01);
    WETHInterface weth = WETHInterface(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
    address aaveLendingPoolAddress = address(0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2); 
    address aaveRewards = address(0x8164Cc65827dcFe994AB23944CBC90e0aa80bFcb);
    uint256 targetFloatPercent = 1e17; // 10%
    address aweth = address(0x030bA81f1c18d280636F32af80b9AAd02Cf0854e);

    function setUp() public {
        solidVault = new SolidVault(ERC20(address(weth)), owner, aaveLendingPoolAddress, aaveRewards, targetFloatPercent);
    }

    function testConstructor() public {
        ERC20 asset = solidVault.asset();
        assertEq(address(asset), address(weth));
        assertEq(solidVault.owner(), owner);
        assertEq(solidVault.aaveLendingPoolAddress(), aaveLendingPoolAddress);
        assertEq(solidVault.aaveRewards(), aaveRewards);
        assertEq(solidVault.targetFloatPercent(), targetFloatPercent);
    }

    function testDeposit() public {
        // wrap ETH
        weth.deposit{value: 1 ether}();
        uint256 initialWethBalance = weth.balanceOf(address(this));
        // approve
        weth.approve(address(solidVault), 1 ether);
        // deposit on aave
        solidVault.deposit(1 ether, address(this));
        // check balance
        assertEq(solidVault.totalHoldings(), 1000000000000000000);      
        assertEq(weth.balanceOf(address(this)), initialWethBalance - 1 ether);
        assertEq(solidVault.balanceOf(address(this)), 1 ether);

        IPool aaveLendingPool = IPool(aaveLendingPoolAddress);
        (uint256 totalLiquidityETH, , , , , ) = aaveLendingPool.getUserAccountData(address(solidVault));

        /**The totalLiquidityETH represents the total available liquidity in the Aave pool for a specific asset,
         * in this case, WETH. When you deposit 1 WETH into the Aave pool, you're essentially contributing to the 
         * overall liquidity of the pool. The value you're seeing (190815786500) is not your individual deposited 
         * amount but the total liquidity in the pool, which includes your 1 WETH deposit as well as deposits from other users.
         **/
        assertEq(totalLiquidityETH,190815786500);

        /**
         * If you want to check your own balance on Aave after depositing, we should query the balance of the aWETH 
         * (Aave interest-bearing WETH) associated with solidvault.
         */
        address aWETHAddress = aaveLendingPool.getReserveData(address(weth)).aTokenAddress;
        IERC20 aWETH = IERC20(aWETHAddress);
        assertEq(aWETH.balanceOf(address(solidVault)), 1 ether);


    }        
}


