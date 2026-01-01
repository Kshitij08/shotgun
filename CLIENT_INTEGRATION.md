# Client Integration Guide

## How Client Interacts with Server

### Flow

1. **Start Game** (On-Chain)
   ```javascript
   // Player calls contract
   await contract.startGame({ value: totalCost });
   
   // Wait for seed
   const baseSeed = await contract.getBaseSeed(playerAddress);
   ```

2. **Request Game from Server**
   ```javascript
   // Send baseSeed to server
   const response = await fetch('/api/game/start', {
     method: 'POST',
     body: JSON.stringify({
       playerAddress: walletAddress,
       baseSeed: baseSeed
     })
   });
   
   const { gameSeed, gameState } = await response.json();
   
   // Initialize game with server's gameSeed
   reseed(gameSeed);
   setGameState(gameState);
   ```

3. **Play Game** (Client shows UI, Server validates)
   ```javascript
   // Player makes move (client-side)
   const move = { type: 'shoot', target: 'dealer' };
   
   // Send to server for validation
   const response = await fetch('/api/game/move', {
     method: 'POST',
     body: JSON.stringify({
       playerAddress: walletAddress,
       move: move
     })
   });
   
   const { gameState, gameEnded, result, signature } = await response.json();
   
   // Update client state
   setGameState(gameState);
   
   // If game ended and player won
   if (gameEnded && result.finalDealerHealth === 0) {
     // Claim on-chain with signature
     await contract.claimWin(
       result.finalPlayerHealth,
       result.finalDealerHealth,
       result.gameSeed,
       result.endBlockNumber,
       signature
     );
   }
   ```

## Security Benefits

### 1. Prevents Prediction
- Server processes seed with secret → unpredictable
- Player can't clone repo and simulate
- Even with baseSeed, can't predict gameSeed

### 2. Prevents Fake Claims
- Server signs result → can't claim without signature
- Contract verifies signature → only valid wins paid
- Server validates all moves → can't cheat

### 3. Works with Your Game
- Server handles multiple rounds
- Server handles roulette wheel
- Server manages items/inventory
- All game logic on server

## Client Code Changes

### Minimal Changes Needed

1. **Add server communication**
   ```javascript
   const SERVER_URL = 'https://your-server.com';
   
   async function startGameWithServer(baseSeed) {
     const response = await fetch(`${SERVER_URL}/api/game/start`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         playerAddress: walletAddress,
         baseSeed: baseSeed
       })
     });
     return await response.json();
   }
   ```

2. **Send moves to server**
   ```javascript
   async function processMoveWithServer(move) {
     const response = await fetch(`${SERVER_URL}/api/game/move`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         playerAddress: walletAddress,
         move: move
       })
     });
     return await response.json();
   }
   ```

3. **Claim with signature**
   ```javascript
   async function claimWinWithSignature(result, signature) {
     await contract.claimWin(
       result.finalPlayerHealth,
       result.finalDealerHealth,
       result.gameSeed,
       result.endBlockNumber,
       signature
     );
   }
   ```

## Server Requirements

### Security
- ✅ Secure server secret (environment variable)
- ✅ Secure server wallet (hardware wallet recommended)
- ✅ Rate limiting
- ✅ Input validation
- ✅ Monitoring/logging

### Infrastructure
- ✅ Reliable hosting
- ✅ Database for game state (not just in-memory)
- ✅ Backup/recovery
- ✅ Load balancing (if needed)

## Deployment

1. **Deploy contract** with server wallet address
2. **Set up server** with:
   - Server secret key
   - Server wallet private key
   - RPC URL for blockchain
   - Contract address
3. **Update client** to use server API
4. **Test thoroughly**
5. **Monitor** for issues

## Advantages

| Feature | On-Chain | Server-Based |
|---------|----------|--------------|
| Complexity | High | Low |
| Gas Cost | 500k+ | ~50k |
| Prediction | Possible | Prevented |
| Fake Claims | Possible | Prevented |
| Multiple Rounds | Complex | Simple |
| Roulette Wheel | Complex | Simple |
| Maintenance | High | Low |

This is the industry-standard approach for blockchain games!

