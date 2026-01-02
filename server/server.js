/**
 * Server Implementation Example
 * 
 * This server handles:
 * 1. Processing the base seed with server secret (prevents prediction)
 * 2. Running game logic (multiple rounds, roulette wheel)
 * 3. Signing game results (prevents fake claims)
 */

const express = require('express');
const { ethers } = require('ethers');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Server configuration
const SERVER_SECRET = process.env.SERVER_SECRET_KEY; // Keep this secret!
const SERVER_WALLET = new ethers.Wallet(process.env.SERVER_PRIVATE_KEY); // Server wallet for signing
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// In-memory game storage (use database in production)
const games = new Map();

/**
 * Generate game seed from base seed
 * This prevents prediction because:
 * - Server secret is unknown to players
 * - Server nonce is random per game
 * - Even with baseSeed, can't predict gameSeed
 */
function generateGameSeed(baseSeed, playerAddress, blockNumber) {
  const serverNonce = crypto.randomBytes(32);
  const gameSeed = ethers.keccak256(
    ethers.solidityPacked(
      ['bytes32', 'bytes32', 'bytes32', 'address', 'uint256'],
      [
        baseSeed,
        ethers.hexlify(crypto.createHash('sha256').update(SERVER_SECRET).digest()), // Server secret hash
        ethers.hexlify(serverNonce),
        playerAddress,
        blockNumber
      ]
    )
  );
  
  return { gameSeed, serverNonce };
}

/**
 * Initialize game state (simplified - implement full game logic)
 */
function initializeGame(gameSeed) {
  // Use gameSeed to initialize RNG
  // This would use your mulberry32 or similar RNG
  // For now, simplified example
  
  return {
    round: 0,
    playerHealth: 8,
    dealerHealth: 8,
    gameSeed: gameSeed,
    // ... other game state
  };
}

/**
 * Process player move (simplified)
 */
function processMove(gameState, move) {
  // Validate move
  // Update game state
  // Handle rounds, shells, items, etc.
  
  // This is where your full game logic would go
  // Multiple rounds, roulette wheel, items, etc.
  
  return {
    ...gameState,
    // Updated state
  };
}

// API Routes

/**
 * POST /api/game/start
 * Start a new game session
 */
app.post('/api/game/start', async (req, res) => {
  try {
    const { playerAddress, baseSeed } = req.body;
    
    if (!playerAddress || !baseSeed) {
      return res.status(400).json({ error: 'Missing playerAddress or baseSeed' });
    }
    
    // Get current block number (from provider)
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const blockNumber = await provider.getBlockNumber();
    
    // Generate game seed (prevents prediction)
    const { gameSeed, serverNonce } = generateGameSeed(
      baseSeed,
      playerAddress,
      blockNumber
    );
    
    // Initialize game state
    const gameState = initializeGame(gameSeed);
    
    // Store game
    games.set(playerAddress, {
      gameSeed,
      serverNonce,
      state: gameState,
      startTime: Date.now(),
      baseSeed // Store for audit
    });
    
    res.json({
      gameSeed, // Return to client for verification
      gameState: {
        round: gameState.round,
        playerHealth: gameState.playerHealth,
        dealerHealth: gameState.dealerHealth,
        // Don't expose full state, just what client needs
      }
    });
  } catch (error) {
    console.error('Error starting game:', error);
    res.status(500).json({ error: 'Failed to start game' });
  }
});

/**
 * POST /api/game/move
 * Process a player move
 */
app.post('/api/game/move', async (req, res) => {
  try {
    const { playerAddress, move } = req.body;
    
    const game = games.get(playerAddress);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Process move (validates and updates state)
    const newState = processMove(game.state, move);
    game.state = newState;
    
    // Check if game ended
    if (newState.playerHealth <= 0 || newState.dealerHealth <= 0) {
      // Game ended, prepare result
      const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
      const endBlockNumber = await provider.getBlockNumber();
      
      const gameResult = {
        playerAddress,
        finalPlayerHealth: newState.playerHealth,
        finalDealerHealth: newState.dealerHealth,
        gameSeed: game.gameSeed,
        endBlockNumber
      };
      
      // Sign result
      const messageHash = ethers.keccak256(
        ethers.solidityPacked(
          ['address', 'uint8', 'uint8', 'bytes32', 'uint256'],
          [
            playerAddress,
            newState.playerHealth,
            newState.dealerHealth,
            game.gameSeed,
            endBlockNumber
          ]
        )
      );
      
      // Sign with server wallet
      const signature = await SERVER_WALLET.signMessage(ethers.getBytes(messageHash));
      
      res.json({
        gameState: newState,
        gameEnded: true,
        result: gameResult,
        signature
      });
    } else {
      res.json({
        gameState: newState,
        gameEnded: false
      });
    }
  } catch (error) {
    console.error('Error processing move:', error);
    res.status(500).json({ error: 'Failed to process move' });
  }
});

/**
 * POST /api/game/result
 * Get signed game result (called when game ends)
 */
app.post('/api/game/result', async (req, res) => {
  try {
    const { playerAddress } = req.body;
    
    const game = games.get(playerAddress);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const state = game.state;
    
    // Get end block number
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const endBlockNumber = await provider.getBlockNumber();
    
    // Create result message
    const gameResult = {
      playerAddress,
      finalPlayerHealth: state.playerHealth,
      finalDealerHealth: state.dealerHealth,
      gameSeed: game.gameSeed,
      endBlockNumber
    };
    
    // Sign result
    const messageHash = ethers.keccak256(
      ethers.solidityPacked(
        ['address', 'uint8', 'uint8', 'bytes32', 'uint256'],
        [
          playerAddress,
          state.playerHealth,
          state.dealerHealth,
          game.gameSeed,
          endBlockNumber
        ]
      )
    );
    
    const signature = await SERVER_WALLET.signMessage(ethers.getBytes(messageHash));
    
    res.json({
      result: gameResult,
      signature
    });
  } catch (error) {
    console.error('Error getting result:', error);
    res.status(500).json({ error: 'Failed to get result' });
  }
});

/**
 * GET /api/game/state/:playerAddress
 * Get current game state (for reconnection)
 */
app.get('/api/game/state/:playerAddress', (req, res) => {
  const game = games.get(req.params.playerAddress);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  res.json({
    gameState: {
      round: game.state.round,
      playerHealth: game.state.playerHealth,
      dealerHealth: game.state.dealerHealth,
      // ... other public state
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server wallet: ${SERVER_WALLET.address}`);
});

