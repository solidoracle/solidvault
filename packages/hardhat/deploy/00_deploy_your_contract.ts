import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys a contract named "SolidVault" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deploySolidVault: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const wethAddress = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
  const aaveLendingPoolAddress = "0x73D94B5D5C0a68Fe279a91b23D2165D2DAaA41d3";
  const aaveRewardsAddress = "0xCCB14936C2E000ED8393A571D15A2672537838Ad";

  await deploy("SolidVault", {
    from: deployer,
    // Contract constructor arguments
    args: [wethAddress, deployer, aaveLendingPoolAddress, aaveRewardsAddress],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract
  await hre.ethers.getContract("SolidVault", deployer);
};

export default deploySolidVault;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags SolidVault
deploySolidVault.tags = ["SolidVault"];
