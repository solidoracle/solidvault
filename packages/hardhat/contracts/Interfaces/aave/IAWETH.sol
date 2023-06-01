// SPDX-License-Identifier: AGPL-3.0
pragma solidity >=0.8.0 <0.9.0;

import  { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';


interface IAWETH is IERC20 {

    function scaledBalanceOf(address asset) external returns (uint);
    function getScaledUserBalanceAndSupply(address asset) external returns (uint, uint);
}

