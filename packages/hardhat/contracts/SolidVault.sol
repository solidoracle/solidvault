//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import { SafeTransferLib, ERC4626, ERC20 } from "solmate/src/mixins/ERC4626.sol";
import "solmate/src/auth/Owned.sol";
import "solmate/src/utils/FixedPointMathLib.sol";
import "solmate/src/utils/ReentrancyGuard.sol";
import "solmate/src/utils/SafeCastLib.sol";
import "solmate/src/tokens/WETH.sol";
import "./Interfaces/aave/IPool.sol";
import "./Interfaces/aave/IAWETH.sol";
import "./Interfaces/aave/IRewardsController.sol";
import  { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {console} from "../lib/forge-std/src/console.sol";


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
    uint256 public strategyBalance; // used in harvest, but not set in deposit or deducted from withdraw
    ERC20 public immutable UNDERLYING;
    uint256 public feePercent;


    // https://docs.aave.com/developers/deployed-contracts/v3-testnet-addresses
    address public immutable aaveLendingPoolAddress; 
    address public immutable aaveRewards;

    constructor(ERC20 _UNDERLYING, address _owner, address _aaveLendingPoolAddress, address _aaveRewards)
        ERC4626(_UNDERLYING, "SolidVault", "SOV")
        Owned(_owner)
    {
        aaveLendingPoolAddress = _aaveLendingPoolAddress;
        aaveRewards = _aaveRewards;
        // implicitly inherited from ERC20, which is passed as an argument to the ERC4626 constructor. 
        BASE_UNIT = 10**decimals;
        UNDERLYING = _UNDERLYING;
    }

    /*///////////////////////////////////////////////////////////////
                        DEPOSIT/WITHDRAWAL LOGIC
    //////////////////////////////////////////////////////////////*/

    /**
     * @inheritdoc ERC4626
     */
    function afterDeposit(uint256 assets, uint256) internal override nonReentrant {
        // deposit assets to Aave
        ERC20(asset).approve(aaveLendingPoolAddress, assets);
        // we are not considering the float here -- we are depositing everything
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
        pullFromStrategy(underlyingAmount);
    }

    /*///////////////////////////////////////////////////////////////
                        STRATEGY WITHDRAWAL LOGIC
    //////////////////////////////////////////////////////////////*/

    function pullFromStrategy(uint256 underlyingAmount) public {
        IPool(aaveLendingPoolAddress).withdraw(address(asset), underlyingAmount, address(this));

        unchecked {
            // Account for the withdrawal done
            // Cannot underflow as the balances of some strategies cannot exceed the sum of all.
            totalHoldings -= underlyingAmount;
        }
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
    }

    function totalFloat() public view returns (uint256) {
        return UNDERLYING.balanceOf(address(this));
    }
    
    /*///////////////////////////////////////////////////////////////
                             HARVEST LOGIC
    //////////////////////////////////////////////////////////////*/

    function harvest() external onlyOwner {
        // Get the Vault's current total strategy holdings.
        uint256 oldTotalHoldings = totalHoldings;

        // Used to store the total profit accrued by the aave strategy.
        uint256 totalProfitAccrued;

        // Used to store the new total strategy holdings after harvesting.
        uint256 newTotalHoldings = oldTotalHoldings;
    
        // Get the strategy's previous and current balance.
        uint256 balanceLastHarvest = totalHoldings; // could use strategyBalance?

        IPool aaveLendingPool = IPool(aaveLendingPoolAddress);

        DataTypes.ReserveData memory reserveData = aaveLendingPool.getReserveData(address(asset));
        address aWETHAddress = reserveData.aTokenAddress;
        uint256 index = reserveData.liquidityIndex;

        IAWETH aWETH = IAWETH(aWETHAddress);

        uint256 scaledBalance = aWETH.scaledBalanceOf(address(this));
        uint256 intermediateResult = FixedPointMathLib.mulWadDown(scaledBalance, index);
        uint balanceThisHarvest = FixedPointMathLib.mulDivDown(intermediateResult, 1e18, 1e27);

        // Increase/decrease newTotalHoldings based on the profit/loss registered.
        newTotalHoldings = newTotalHoldings + balanceThisHarvest - balanceLastHarvest;
        
        unchecked {
            // Update the total profit accrued while counting losses as zero profit.
            totalProfitAccrued += balanceThisHarvest > balanceLastHarvest
                ? balanceThisHarvest - balanceLastHarvest // Profits since last harvest.
                : 0; // If the strategy registered a net loss we don't have any new profit.
        }

        // Compute fees as the fee percent multiplied by the profit.
        uint256 feesAccrued = totalProfitAccrued.mulDivDown(feePercent, 1e18);
    
        // If we accrued any fees, mint an equivalent amount of rvTokens.
        _mint(address(this), feesAccrued.mulDivDown(BASE_UNIT, convertToAssets(BASE_UNIT)));
    
        // Set total holdings to our new total.
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

    /// @notice Emitted when the fee percentage is updated.
    /// @param user The authorized user who triggered the update.
    /// @param newFeePercent The new fee percentage.
    event FeePercentUpdated(address indexed user, uint256 newFeePercent);

    /// @notice Sets a new fee percentage.
    /// @param newFeePercent The new fee percentage.
    function setFeePercent(uint256 newFeePercent) external onlyOwner {
        // A fee percentage over 100% doesn't make sense.
        require(newFeePercent <= 1e18, "FEE_TOO_HIGH");

        // Update the fee percentage.
        feePercent = newFeePercent;

        emit FeePercentUpdated(msg.sender, newFeePercent);
    }

    /*///////////////////////////////////////////////////////////////
                             POOL DATA
    //////////////////////////////////////////////////////////////*/

    function getReserveData(address asset) external view returns (uint256 liquidityRate, uint40 lastUpdateTimestamp) {
        DataTypes.ReserveData memory reserve =
        IPool(aaveLendingPoolAddress).getReserveData(asset);

        return (
            reserve.currentLiquidityRate,
            reserve.lastUpdateTimestamp
        );
    }

    /*///////////////////////////////////////////////////////////////
                          RECIEVE ETHER LOGIC
    //////////////////////////////////////////////////////////////*/

    /// @dev Required for the Vault to receive unwrapped ETH.
    receive() external payable {
        // Convert the ETH to WETH
        WETH(payable(address(asset))).deposit{value: msg.value}();

        // Deposit the WETH to the Vault
        this.deposit(msg.value, msg.sender);
     }

}

