// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../contracts/SolidVault.sol";
import "solmate/src/tokens/WETH.sol";

import { Vm } from 'forge-std/Vm.sol';

contract SolidVaultTest is Test {
    SolidVault public solidVault;
    address owner = address(0x01);
    address weth = 0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6;
    address aaveLendingPoolAddress = 0xCE5f067F3D0AEe076EB6122c8989A48f82f2499a; 
    address aaveRewards = 0x12Ff6eba0767076B056cD722aC8817D771bbCB97;
    uint256 targetFloatPercent = 1e17 * 5 ; // 50%

    function setUp() public {


        solidVault = new SolidVault(ERC20(address(weth)), owner,aaveLendingPoolAddress, aaveRewards, targetFloatPercent);

        console.log('finish setup');
    }

    
}


