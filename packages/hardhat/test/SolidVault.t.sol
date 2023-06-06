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
    // MAINNET CONFIG
    // WETHInterface weth = WETHInterface(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
    // address aaveLendingPoolAddress = address(0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2); 
    // address aaveRewards = address(0x8164Cc65827dcFe994AB23944CBC90e0aa80bFcb);
    // address aweth = address(0x030bA81f1c18d280636F32af80b9AAd02Cf0854e);

    // function setUp() public {
    //     solidVault = new SolidVault(ERC20(address(weth)), owner, aaveLendingPoolAddress, aaveRewards);
    // }

    // GOERLI CONFIG
    WETHInterface weth = WETHInterface(0xCCB14936C2E000ED8393A571D15A2672537838Ad);
    address aaveLendingPoolAddress = address(0x7b5C526B7F8dfdff278b4a3e045083FBA4028790); 
    address aaveRewards = address(0xCCB14936C2E000ED8393A571D15A2672537838Ad);
    address aweth = address(0xC93c704dCB45a70D6DA1011FfA48B3D5185201E0);
    function setUp() public {
        solidVault = new SolidVault(ERC20(address(weth)), owner, aaveLendingPoolAddress, aaveRewards);
    }
   

    function testConstructor() public {
        ERC20 asset = solidVault.asset();
        assertEq(address(asset), address(weth));
        assertEq(solidVault.owner(), owner);
        assertEq(solidVault.aaveLendingPoolAddress(), aaveLendingPoolAddress);
        assertEq(solidVault.aaveRewards(), aaveRewards);
    }


    function testETHDeposit() private {
        (bool success, ) = address(solidVault).call{value: 1 ether}("");

        assertEq(solidVault.totalHoldings(), 1 ether);      
        assertEq(solidVault.balanceOf(address(this)), 1 ether); 

        IPool aaveLendingPool = IPool(aaveLendingPoolAddress);

        address aWETHAddress = aaveLendingPool.getReserveData(address(weth)).aTokenAddress;
        IERC20 aWETH = IERC20(aWETHAddress);
        assertEq(aWETH.balanceOf(address(solidVault)), 1 ether);
    }

    function testETHDepositFuzz(uint amount) private {
        amount = bound(amount, 0, address(this).balance);
        (bool success, ) = address(solidVault).call{value: amount}("");

        assertEq(solidVault.totalHoldings(), amount);      
        assertEq(solidVault.balanceOf(address(this)), amount); 
    }

    function testWETHDeposit() private {
        // wrap ETH
        weth.deposit{value: 1 ether}();
        uint256 initialWethBalance = weth.balanceOf(address(this));
        // approve
        weth.approve(address(solidVault), 1 ether);
        // deposit on aave
        solidVault.deposit(1 ether, address(this));
        // check balance
        assertEq(solidVault.totalHoldings(), 1 ether);      
        assertEq(weth.balanceOf(address(this)), initialWethBalance - 1 ether);
        assertEq(solidVault.balanceOf(address(this)), 1 ether); 

        IPool aaveLendingPool = IPool(aaveLendingPoolAddress);
        (uint256 totalLiquidityETH, , , , , ) = aaveLendingPool.getUserAccountData(address(solidVault));

        /**The totalLiquidityETH represents the total available liquidity in the Aave pool for a specific asset,
         * in this case, WETH. When you deposit 1 WETH into the Aave pool, you're essentially contributing to the 
         * overall liquidity of the pool. The value you're seeing (190815786500) is not your individual deposited 
         * amount but the total liquidity in the pool, which includes your 1 WETH deposit as well as deposits from other users.
         **/
        // assertEq(totalLiquidityETH,188763044000); // this changes on every fork

        /**
         * If you want to check your own balance on Aave after depositing, we should query the balance of the aWETH 
         * (Aave interest-bearing WETH) associated with solidvault.
         */
        address aWETHAddress = aaveLendingPool.getReserveData(address(weth)).aTokenAddress;
        IERC20 aWETH = IERC20(aWETHAddress);
        assertEq(aWETH.balanceOf(address(solidVault)), 1 ether);
    }        

    function testWithdraw() private {
        weth.deposit{value: 1 ether}();
        // approve
        weth.approve(address(solidVault), 1 ether);
        // we MUST approve solidVault or other address to spend our vault tokens in case they are the ones calling withdraw
        solidVault.approve( address(solidVault), type(uint256).max);

        // deposit on aave
        solidVault.deposit(1 ether, address(this));

        // withdraw
        uint shares = solidVault.balanceOf(address(this));
        uint assets = solidVault.convertToAssets(shares);
        solidVault.withdraw(assets, address(0x04), address(this)); // we are sending the withdrawn weth to address(0x04)
        assertEq(weth.balanceOf(address(0x04)), 1 ether);
        assertEq(solidVault.totalHoldings(), 0);

    }

    function testWithdrawFuzz(uint amount) public {
        amount = bound(amount, 0, address(this).balance); // for mainnet fork best to bound to a fixed amount, as Aave deposit otherwise can fail

        (bool success, ) = address(solidVault).call{value: amount}("");

        // withdraw
        uint shares = solidVault.balanceOf(address(this));
        uint assets = solidVault.convertToAssets(shares);
        solidVault.withdraw(assets, address(0x04), address(this)); // we are sending the withdrawn weth to address(0x04)
        assertEq(weth.balanceOf(address(0x04)), amount);
        assertEq(solidVault.totalHoldings(), 0);
    }

    function testMultipleUsers(address[] memory users) private {
        uint totalDeposit = 0;
    
        for (uint i = 0; i < users.length; i++) {
            address user = users[i];
            uint randomAmount = bound((uint(keccak256(abi.encodePacked(user, block.timestamp))) % 1 ether), 0, 100 ether);
            
            // Send Ether to the user
            (bool success,) = user.call{value: randomAmount}("");
            require(success, "Transfer failed");
            vm.startPrank(address(user));

            // Each user wraps ETH and approves SolidVault
            WETHInterface(weth).deposit{value: randomAmount}();
            weth.approve(address(solidVault), randomAmount);
    
            // Each user deposits on Aave
            solidVault.deposit(randomAmount, user);

            totalDeposit += randomAmount;
            vm.stopPrank();
        }
    
        // Confirm total deposits
        assertEq(solidVault.totalHoldings(), totalDeposit);
    
        for (uint i = 0; i < users.length; i++) {
            address user = users[i];
    
            // Each user withdraws
            uint shares = solidVault.balanceOf(user);
            uint assets = solidVault.convertToAssets(shares);
            solidVault.withdraw(assets, user, user);
    
            // Confirm each user's balance
            assertEq(weth.balanceOf(user), assets);
        }
    
        // Confirm total withdrawals
        assertEq(solidVault.totalHoldings(), 0);
    }
    

    function testHarvest() private {
        uint depositAmount = 1 ether;

        (bool success, ) = address(solidVault).call{value: depositAmount}("");

        assertEq(solidVault.totalHoldings(), depositAmount);      
        assertEq(solidVault.balanceOf(address(this)), depositAmount); 

        IPool aaveLendingPool = IPool(aaveLendingPoolAddress);

        address aWETHAddress = aaveLendingPool.getReserveData(address(weth)).aTokenAddress;
        IAWETH aWETH = IAWETH(aWETHAddress);
        assertEq(aWETH.balanceOf(address(solidVault)), depositAmount);

        uint256 scaledBalanceBefore = aWETH.scaledBalanceOf(address(solidVault));

        // Advance the blockchain by a certain number of blocks to simulate time passing
        vm.warp(block.timestamp + 365 days);

        // someone else deposits for the update of the liquidity index, and the update of the interest rate
        vm.startPrank(address(owner));
        weth.deposit{value: 1 ether}();
        IERC20(weth).approve(address(aaveLendingPool), 1 ether);
        aaveLendingPool.supply(address(weth), 1 ether, owner, 0);

        uint256 scaledBalance = aWETH.scaledBalanceOf(address(solidVault));
        uint256 intermediateResult = FixedPointMathLib.mulWadDown(scaledBalance, aaveLendingPool.getReserveData(address(weth)).liquidityIndex);
        uint balanceThisHarvest = FixedPointMathLib.mulDivDown(intermediateResult, 1e18, 1e27);

        uint256 expectedYield = balanceThisHarvest - depositAmount;

        uint256 oldTotalHoldings = solidVault.totalHoldings();

        solidVault.harvest();

        // Verify yield was correctly transferred
        uint256 yield = balanceThisHarvest > oldTotalHoldings ? balanceThisHarvest - oldTotalHoldings : 0;
  
        assertEq(yield, expectedYield);
    }

    function testFee() private {
        uint depositAmount = 1 ether;

        (bool success, ) = address(solidVault).call{value: depositAmount}("");

        assertEq(solidVault.totalHoldings(), depositAmount);      
        assertEq(solidVault.balanceOf(address(this)), depositAmount); 

        IPool aaveLendingPool = IPool(aaveLendingPoolAddress);

        address aWETHAddress = aaveLendingPool.getReserveData(address(weth)).aTokenAddress;
        IAWETH aWETH = IAWETH(aWETHAddress);
        assertEq(aWETH.balanceOf(address(solidVault)), depositAmount);


        uint256 scaledBalanceBefore = aWETH.scaledBalanceOf(address(solidVault));
        DataTypes.ReserveData memory reserveData = aaveLendingPool.getReserveData(address(weth));

        // Advance the blockchain by a certain number of blocks to simulate time passing
        vm.warp(block.timestamp + 365 days);

        // someone else deposits for the update of the liquidity index and interest (!)
        vm.startPrank(address(owner));
        weth.deposit{value: 1 ether}();
        IERC20(weth).approve(address(aaveLendingPool), 1 ether);
        aaveLendingPool.supply(address(weth), 1 ether, owner, 0);
        
        uint feePercent = 1e8;
        solidVault.setFeePercent(feePercent);
        assertEq(solidVault.feePercent(), feePercent);

        uint256 oldTotalHoldings = solidVault.totalHoldings();
        solidVault.harvest();

        uint256 scaledBalance = aWETH.scaledBalanceOf(address(solidVault));
        console.logUint(aaveLendingPool.getReserveData(address(weth)).liquidityIndex);
        uint256 intermediateResult = FixedPointMathLib.mulWadDown(scaledBalance, aaveLendingPool.getReserveData(address(weth)).liquidityIndex);
        uint balanceThisHarvest = FixedPointMathLib.mulDivDown(intermediateResult, 1e18, 1e27);
        uint256 yield = balanceThisHarvest > oldTotalHoldings ? balanceThisHarvest - oldTotalHoldings : 0;
        // Calculate the expected fee
        uint256 expectedFee = FixedPointMathLib.mulDivDown(yield, feePercent, 1e18);

        // Get the actual fee from SolidVault's own balance
        uint256 actualFee = solidVault.balanceOf(address(solidVault));

        // Check if the actual fee matches the expected fee
        assertEq(actualFee, expectedFee);
    }
}


