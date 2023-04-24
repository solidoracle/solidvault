//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import { SafeTransferLib, ERC4626, ERC20 } from "solmate/src/mixins/ERC4626.sol";
import "solmate/src/auth/Owned.sol";
import "solmate/src/utils/FixedPointMathLib.sol";
import "solmate/src/utils/ReentrancyGuard.sol";
import "solmate/src/utils/SafeCastLib.sol";
import "solmate/src/tokens/WETH.sol";
import "./Interfaces/aave/IPool.sol";
import "./Interfaces/aave/IRewardsController.sol";


/**
 * @author @solidoracle
 *
 * An ERC4626 vault that earns yield from Aave
 * 
 *  /$$$$$$   /$$$$$$  /$$       /$$$$$$ /$$$$$$$  /$$    /$$  /$$$$$$  /$$   /$$ /$$    /$$$$$$$$
 * /$$__  $$ /$$__  $$| $$      |_  $$_/| $$__  $$| $$   | $$ /$$__  $$| $$  | $$| $$   |__  $$__/
 *| $$  \__/| $$  \ $$| $$        | $$  | $$  \ $$| $$   | $$| $$  \ $$| $$  | $$| $$      | $$   
 *|  $$$$$$ | $$  | $$| $$        | $$  | $$  | $$|  $$ / $$/| $$$$$$$$| $$  | $$| $$      | $$    
 * \____  $$| $$  | $$| $$        | $$  | $$  | $$ \  $$ $$/ | $$__  $$| $$  | $$| $$      | $$   
 * /$$  \ $$| $$  | $$| $$        | $$  | $$  | $$  \  $$$/  | $$  | $$| $$  | $$| $$      | $$   
 *|  $$$$$$/|  $$$$$$/| $$$$$$$$ /$$$$$$| $$$$$$$/   \  $/   | $$  | $$|  $$$$$$/| $$$$$$$$| $$   
 * \______/  \______/ |________/|______/|_______/     \_/    |__/  |__/ \______/ |________/|__/   
 *                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
 */


contract SolidVault is ERC4626, Owned, ReentrancyGuard {
    using SafeTransferLib for ERC20;
    using FixedPointMathLib for uint256;    
    using SafeCastLib for uint256;
    uint256 internal immutable BASE_UNIT;
    uint256 public totalHoldings;
    uint256 public strategyBalance;

    // https://docs.aave.com/developers/deployed-contracts/v3-testnet-addresses
    address public immutable aaveLendingPoolAddress; 
    address public immutable aaveRewards;

    constructor(ERC20 _token, address _owner, address _aaveLendingPoolAddress, address _aaveRewards, uint256 _targetFloatPercent)
        ERC4626(_token, "SolidVault", "SOV")
        Owned(_owner)
    {
        aaveLendingPoolAddress = _aaveLendingPoolAddress;
        aaveRewards = _aaveRewards;
        targetFloatPercent = _targetFloatPercent;
        // implicitly inherited from ERC20, which is passed as an argument to the ERC4626 constructor. 
        BASE_UNIT = 10**decimals;
    }


    /*///////////////////////////////////////////////////////////////
                       TARGET FLOAT CONFIGURATION
    //////////////////////////////////////////////////////////////*/

    /// @notice The desired percentage of the Vault's holdings to keep as float.
    /// @dev A fixed point number where 1e18 represents 100% and 0 represents 0%.
    uint256 public targetFloatPercent;

    /// @notice Set a new target float percentage.
    /// @param newTargetFloatPercent The new target float percentage.
    function setTargetFloatPercent(uint256 newTargetFloatPercent) external onlyOwner {
        // A target float percentage over 100% doesn't make sense.
        require(newTargetFloatPercent <= 1e18, "TARGET_TOO_HIGH");

        // Update the target float percentage.
        targetFloatPercent = newTargetFloatPercent;

    }

    /// @notice Returns the amount of underlying tokens that idly sit in the Vault.
    /// @return The amount of underlying tokens that sit idly in the Vault.
    function totalFloat() public view returns (uint256) {
        return asset.balanceOf(address(this));
    }

    /*///////////////////////////////////////////////////////////////
                        DEPOSIT/WITHDRAWAL LOGIC
    //////////////////////////////////////////////////////////////*/

    /**
     * @inheritdoc ERC4626
     */
    function afterDeposit(uint256 assets, uint256) internal override nonReentrant {
        // deposit assets to Aave
        // ERC20(asset).approve(aaveLendingPoolAddress, 0);
        ERC20(asset).approve(aaveLendingPoolAddress, assets);
        

        IPool(aaveLendingPoolAddress).getReserveData(address(asset));
        IPool(aaveLendingPoolAddress).supply(address(asset), assets, address(this), 0);

        // Increase totalHoldings to account for the deposit.
        totalHoldings += assets;
    }

    function beforeWithdraw(uint256 assets, uint256) internal override {
        // Retrieve underlying tokens from strategy/float.
        retrieveUnderlying(assets);
    }

    /// @dev Retrieves a specific amount of underlying tokens held in the strategy and/or float.
    /// @dev Only withdraws from strategies if needed and maintains the target float percentage if possible.
    /// @param underlyingAmount The amount of underlying tokens to retrieve.
    function retrieveUnderlying(uint256 underlyingAmount) internal {
        // Get the Vault's floating balance.
        uint256 float = totalFloat();

        // If the amount is greater than the float, withdraw from strategy.
        if (underlyingAmount > float) {
            // Compute the amount needed to reach our target float percentage, after the withdrawal of underlyingAmount.
            uint256 floatMissingForTarget = (totalAssets() - underlyingAmount).mulWadDown(targetFloatPercent);

            // Compute the bare minimum amount we need for this withdrawal.
            uint256 floatMissingForWithdrawal = underlyingAmount - float;

            // Pull enough to cover the withdrawal and reach our target float percentage.
            pullFromStrategy(floatMissingForWithdrawal + floatMissingForTarget);
        }

        // TODO: what happens if underlyingAmount > totalFloat()?
    }

    /*///////////////////////////////////////////////////////////////
                        STRATEGY WITHDRAWAL LOGIC
    //////////////////////////////////////////////////////////////*/

    function pullFromStrategy(uint256 underlyingAmount) internal {
        // Get the balance of the aave strategy before we withdraw from it.
        (uint256 totalCollateralETH, uint256 totalDebtETH, uint256 availableBorrowsETH, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor) = IPool(aaveLendingPoolAddress).getUserAccountData(address(asset));
        // require(totalCollateralETH == strategyBalance, "STRATEGY_BALANCE_MISMATCH"); TODO: should this hold?

        // We want to pull as much as we can from the strategy, but no more than we need.
        uint256 amountToPull = totalCollateralETH > underlyingAmount ? underlyingAmount : totalCollateralETH;

        unchecked {
            // Compute the balance of the strategy that will remain after we withdraw.
            // Cannot underflow as we cap the amount to pull at the strategy's balance.
            uint256 strategyBalanceAfterWithdrawal = strategyBalance - amountToPull;

            // Without this the next harvest would count the withdrawal as a loss. TODO: understand how we integrate withdraws into harvests
            strategyBalance = strategyBalanceAfterWithdrawal.safeCastTo248();

            // Withdraw from the strategy and revert if returns an error code.
            require(IPool(aaveLendingPoolAddress).withdraw(address(asset), amountToPull, address(this)) == 0, "WITHDRAWAL_FAILED");
        }
        
        unchecked {
            // Account for the withdrawal done
            // Cannot underflow as the balances of some strategies cannot exceed the sum of all.
            totalHoldings -= underlyingAmount;
        }

        // Cache the Vault's balance of ETH.
        uint256 ethBalance = address(this).balance;

        // If we have some ETH, wrap it into WETH.
        // TODO: don't think this is needed -- aren't we withdrawing WETH?
        if (ethBalance != 0) WETH(payable(address(asset))).deposit{value: ethBalance}();
    }

    /*///////////////////////////////////////////////////////////////
                        VAULT ACCOUNTING LOGIC
    //////////////////////////////////////////////////////////////*/

    /// @notice Calculates the total amount of underlying tokens the Vault holds.
    /// @return totalUnderlyingHeld The total amount of underlying tokens the Vault holds.
    function totalAssets() public view override returns (uint256 totalUnderlyingHeld) {
        unchecked {
            totalUnderlyingHeld = totalHoldings;
        }

        // Include our floating balance in the total.
        totalUnderlyingHeld += totalFloat();
    }
    
    /*///////////////////////////////////////////////////////////////
                             HARVEST LOGIC
    //////////////////////////////////////////////////////////////*/

    function harvest() external onlyOwner {
        // Get the Vault's current total strategy holdings.
        uint256 oldTotalHoldings = totalHoldings;

        // Used to store the total profit accrued by the strategies.
        uint256 totalProfitAccrued;

        // Used to store the new total strategy holdings after harvesting.
        uint256 newTotalHoldings = oldTotalHoldings;

        // Get the strategy's previous and current balance.
        uint256 balanceLastHarvest = strategyBalance;
        (uint256 totalCollateralETH,,,,,) = IPool(aaveLendingPoolAddress).getUserAccountData(address(asset));

        uint256 balanceThisHarvest = totalCollateralETH;
        strategyBalance = balanceThisHarvest;

        // Increase/decrease newTotalStrategyHoldings based on the profit/loss registered.
        // We cannot wrap the subtraction in parenthesis as it would underflow if the strategy had a loss.
        newTotalHoldings = newTotalHoldings + balanceThisHarvest - balanceLastHarvest;

        totalProfitAccrued += balanceThisHarvest > balanceLastHarvest
                    ? balanceThisHarvest - balanceLastHarvest // Profits since last harvest.
                    : 0; // If the strategy registered a net loss we don't have any new profit.


        // Compute fees as the fee percent multiplied by the profit.
        // No fees at the moment
        uint256 feesAccrued = totalProfitAccrued.mulDivDown(0, 1e18);

        // If we accrued any fees, mint an equivalent amount of vault tokens.
        // Authorized users can claim the newly minted tokens via claimFees.
        _mint(address(this), feesAccrued.mulDivDown(BASE_UNIT, convertToAssets(BASE_UNIT)));

        // Set strategy holdings to our new total.
        totalHoldings = newTotalHoldings;
    }

    /*///////////////////////////////////////////////////////////////
                             FEE & REWARD CLAIM LOGIC
    //////////////////////////////////////////////////////////////*/

    function claimFees(uint256 amount) external onlyOwner {
        // Transfer the provided amount of rvTokens to the caller.
        asset.safeTransfer(msg.sender, amount);
    }

    // TODO: not sure when to call this
    function claimAaveRewards(address[] calldata _assets, address _to) external onlyOwner {
        IRewardsController(aaveRewards).claimAllRewards(_assets, _to);
    }

    /*///////////////////////////////////////////////////////////////
                          RECIEVE ETHER LOGIC
    //////////////////////////////////////////////////////////////*/

    /// @dev Required for the Vault to receive unwrapped ETH.
    receive() external payable {}

}

