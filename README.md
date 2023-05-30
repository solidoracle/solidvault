# 🔮🏦SolidVault || 🏗 Scaffold-Eth 2

## Overview

Solidvault is a vault that leverages the solmate library erc4626 contract to allow for depositing weth on AAVE and earn yield.

You can deposit either goerli ETH directly, or WETH(must be wrapped at this address 0xCCB14936C2E000ED8393A571D15A2672537838Ad for it to work)

Once deposited, you are givin a share of the vault in SOV tokens, that represent your ownership. When you want to withdraw, Solidvault gives you back your principal amount and any earnings.

On goerli there are no earnings, but we have provided the addresses for mainnet development.

## Deployment

Create an .env file using the .env.example file as a template.

Then run:

```bash
  yarn install
```

App is setup to deploy on goerli. To deploy and start the app

```bash
  yarn deploy
  yarn start
```

## Tests

We used Foundry for testing, and a Makefile.
To run tests forking from goerli fork, run the following command

```bash
  cd packages/hardhat
  make test-goerli
```

# Acknowledgements

- [ScaffoldETH v2](https://github.com/scaffold-eth/se-2)
