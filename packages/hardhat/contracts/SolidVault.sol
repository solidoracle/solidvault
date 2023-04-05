//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;


import { SafeTransferLib, ERC4626, ERC20 } from "solmate/src/mixins/ERC4626.sol";
import "solmate/src/auth/Owned.sol";
import "solmate/src/utils/FixedPointMathLib.sol";
import "solmate/src/utils/ReentrancyGuard.sol";


/**
 * @author @solidoracle
 */


contract SolidVault is ERC4626, Owned, ReentrancyGuard {
    using SafeTransferLib for ERC20;
    using FixedPointMathLib for uint256;    

    constructor(ERC20 _token, address _owner, address _feeRecipient)
        ERC4626(_token, "SolidVault", "SOV")
        Owned(_owner)
    {}

    /**
     * @inheritdoc ERC4626
     */
    function totalAssets() public view override returns (uint256) {
        assembly { // better safe than sorry
            if eq(sload(0), 2) {
                mstore(0x00, 0xed3ba6a6)
                revert(0x1c, 0x04)
            }
        }
        return asset.balanceOf(address(this));
    }

    /**
     * @inheritdoc ERC4626
     */
    function beforeWithdraw(uint256 assets, uint256 shares) internal override nonReentrant {}

    /**
     * @inheritdoc ERC4626
     */
    function afterDeposit(uint256 assets, uint256 shares) internal override nonReentrant {}


}

