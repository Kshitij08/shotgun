# Shotgun Roulette Smart Contract

## Contract Overview

The `ShotgunRoulette.sol` contract handles game payments and rewards:
- **Play Fee**: 1 MON (charged when starting a game)
- **Win Reward**: 2 MON (paid when player wins)

## Deployment Instructions

### Prerequisites
- Hardhat or Remix IDE
- MetaMask or another Web3 wallet
- MON testnet tokens for deployment

### Using Remix IDE (Recommended for Quick Testing)

1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create a new file `ShotgunRoulette.sol` in the `contracts` folder
3. Copy the contract code from `contracts/ShotgunRoulette.sol`
4. Compile the contract (Solidity version 0.8.20 or compatible)
5. Deploy to Monad Testnet:
   - Network: Monad Testnet (Chain ID: 10143)
   - RPC URL: `https://testnet-rpc.monad.xyz/`
   - Select the `ShotgunRoulette` contract
   - Click "Deploy"
6. Copy the deployed contract address
7. Update `shotgun-app/src/contractConfig.js` with the deployed address:
   ```javascript
   export const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE";
   ```

### Using Hardhat

1. Install Hardhat:
   ```bash
   npm install --save-dev hardhat
   npx hardhat init
   ```

2. Configure `hardhat.config.js` for Monad Testnet:
   ```javascript
   require("@nomicfoundation/hardhat-toolbox");
   
   module.exports = {
     solidity: "0.8.20",
     networks: {
       monadTestnet: {
         url: "https://testnet-rpc.monad.xyz/",
         chainId: 10143,
         accounts: [process.env.PRIVATE_KEY]
       }
     }
   };
   ```

3. Create a deployment script in `scripts/deploy.js`:
   ```javascript
   const hre = require("hardhat");
   
   async function main() {
     const ShotgunRoulette = await hre.ethers.getContractFactory("ShotgunRoulette");
     const contract = await ShotgunRoulette.deploy();
     await contract.waitForDeployment();
     console.log("Contract deployed to:", await contract.getAddress());
   }
   
   main().catch((error) => {
     console.error(error);
     process.exitCode = 1;
   });
   ```

4. Deploy:
   ```bash
   npx hardhat run scripts/deploy.js --network monadTestnet
   ```

5. Update `shotgun-app/src/contractConfig.js` with the deployed address

## Contract Functions

### Public Functions

- `startGame()` - Payable function that charges 1 MON to start a game
- `claimWin()` - Claims 2 MON reward when player wins
- `endGame()` - Ends the game without reward (player lost)
- `hasActiveGame(address)` - Check if a player has an active game
- `getBalance()` - Get contract balance

### Owner Functions

- `withdraw()` - Owner can withdraw contract funds
- `deposit()` - Anyone can deposit funds to contract (for rewards)

## Funding the Contract

Before players can win rewards, the contract needs to be funded with MON tokens:

1. Send MON tokens to the contract address
2. Or use the `deposit()` function to add funds

The contract should have at least 2 MON per active game to ensure rewards can be paid.

## Security Notes

- The contract uses `call()` for transfers (recommended pattern)
- Only one active game per address at a time
- Contract checks sufficient balance before allowing game start
- Owner can withdraw funds if needed

