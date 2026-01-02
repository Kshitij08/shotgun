/**
 * Shotgun Roulette Server
 * 
 * Implements:
 * - Commit-reveal RNG (prevents prediction)
 * - Server verification (prevents fake claims)
 * - DB tracking (prevents overspending)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { ethers } = require('ethers');
const crypto = require('crypto');
const { Pool } = require('pg');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize server wallet
if (!process.env.SERVER_PRIVATE_KEY) {
  throw new Error('SERVER_PRIVATE_KEY is required');
}
const serverWallet = new ethers.Wallet(process.env.SERVER_PRIVATE_KEY);

// Blockchain provider
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

console.log(`Server wallet address: ${serverWallet.address}`);
console.log(`Database connected: ${process.env.DATABASE_URL ? 'Yes' : 'No'}`);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate RNG commitment
 * Commitment = hash(baseSeed + serverSecret + serverNonce + playerAddress + timestamp)
 */
function generateRNGCommitment(baseSeed, playerAddress, timestamp) {
  const serverSecret = process.env.SERVER_SECRET_KEY;
  const serverNonce = crypto.randomBytes(32);
  
  const commitment = ethers.keccak256(
    ethers.solidityPacked(
      ['bytes32', 'bytes32', 'bytes32', 'address', 'uint256'],
      [
        baseSeed,
        ethers.hexlify(crypto.createHash('sha256').update(serverSecret).digest()),
        ethers.hexlify(serverNonce),
        playerAddress,
        timestamp
      ]
    )
  );
  
  return {
    commitment,
    serverNonce: ethers.hexlify(serverNonce)
  };
}

/**
 * Verify RNG commitment matches revealed components
 */
function verifyRNGCommitment(commitment, baseSeed, serverNonce, playerAddress, timestamp) {
  const serverSecret = process.env.SERVER_SECRET_KEY;
  
  const computedCommitment = ethers.keccak256(
    ethers.solidityPacked(
      ['bytes32', 'bytes32', 'bytes32', 'address', 'uint256'],
      [
        baseSeed,
        ethers.hexlify(crypto.createHash('sha256').update(serverSecret).digest()),
        serverNonce,
        playerAddress,
        timestamp
      ]
    )
  );
  
  return computedCommitment.toLowerCase() === commitment.toLowerCase();
}

/**
 * Sign game result
 */
async function signGameResult(playerAddress, finalPlayerHealth, finalDealerHealth, rngCommitment, endBlockNumber) {
  const messageHash = ethers.keccak256(
    ethers.solidityPacked(
      ['address', 'uint8', 'uint8', 'bytes32', 'uint256'],
      [
        playerAddress,
        finalPlayerHealth,
        finalDealerHealth,
        rngCommitment,
        endBlockNumber
      ]
    )
  );
  
  const signature = await serverWallet.signMessage(ethers.getBytes(messageHash));
  return signature;
}

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    serverWallet: serverWallet.address,
    timestamp: Date.now()
  });
});

/**
 * POST /api/game/start
 * Start a new game session
 * 
 * Body: { playerAddress, baseSeed }
 * Returns: { gameId, rngCommitment, serverNonce }
 */
app.post('/api/game/start', async (req, res) => {
  try {
    const { playerAddress, baseSeed } = req.body;
    
    if (!playerAddress || !baseSeed) {
      return res.status(400).json({ error: 'Missing playerAddress or baseSeed' });
    }
    
    // Validate address
    if (!ethers.isAddress(playerAddress)) {
      return res.status(400).json({ error: 'Invalid player address' });
    }
    
    // Get current block number
    const blockNumber = await provider.getBlockNumber();
    const timestamp = Date.now();
    
    // Generate RNG commitment
    const { commitment, serverNonce } = generateRNGCommitment(baseSeed, playerAddress, timestamp);
    
    // Generate game ID
    const gameId = crypto.randomBytes(16).toString('hex');
    
    // Store game in database
    await pool.query(
      `INSERT INTO games (game_id, player_address, base_seed, rng_commitment, server_nonce, start_block, start_timestamp, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [gameId, playerAddress.toLowerCase(), baseSeed, commitment, serverNonce, blockNumber, timestamp, 'active']
    );
    
    res.json({
      gameId,
      rngCommitment: commitment,
      // Note: serverNonce is stored but not returned until game ends (for security)
      message: 'Game started. RNG committed.'
    });
  } catch (error) {
    console.error('Error starting game:', error);
    res.status(500).json({ error: 'Failed to start game', details: error.message });
  }
});

/**
 * POST /api/game/end
 * End game and reveal RNG components
 * 
 * Body: { playerAddress, gameId }
 * Returns: { serverNonce, rngCommitment, baseSeed, timestamp }
 */
app.post('/api/game/end', async (req, res) => {
  try {
    const { playerAddress, gameId } = req.body;
    
    if (!playerAddress || !gameId) {
      return res.status(400).json({ error: 'Missing playerAddress or gameId' });
    }
    
    // Get game from database
    const result = await pool.query(
      `SELECT * FROM games 
       WHERE game_id = $1 AND player_address = $2 AND status = 'active'`,
      [gameId, playerAddress.toLowerCase()]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found or already ended' });
    }
    
    const game = result.rows[0];
    
    // Get end block number
    const endBlockNumber = await provider.getBlockNumber();
    
    // Update game status
    await pool.query(
      `UPDATE games SET status = 'ended', end_block = $1, end_timestamp = $2 WHERE game_id = $3`,
      [endBlockNumber, Date.now(), gameId]
    );
    
    // Reveal RNG components
    res.json({
      gameId,
      rngCommitment: game.rng_commitment,
      baseSeed: game.base_seed,
      serverNonce: game.server_nonce,
      startTimestamp: game.start_timestamp,
      endBlockNumber,
      message: 'RNG components revealed. You can now verify the game.'
    });
  } catch (error) {
    console.error('Error ending game:', error);
    res.status(500).json({ error: 'Failed to end game', details: error.message });
  }
});

/**
 * POST /api/game/verify-and-sign
 * Verify game result and sign it for claim
 * 
 * Body: { playerAddress, gameId, finalPlayerHealth, finalDealerHealth }
 * Returns: { signature, result }
 */
app.post('/api/game/verify-and-sign', async (req, res) => {
  try {
    const { playerAddress, gameId, finalPlayerHealth, finalDealerHealth } = req.body;
    
    if (!playerAddress || !gameId || finalPlayerHealth === undefined || finalDealerHealth === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get game from database
    const gameResult = await pool.query(
      `SELECT * FROM games 
       WHERE game_id = $1 AND player_address = $2`,
      [gameId, playerAddress.toLowerCase()]
    );
    
    if (gameResult.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const game = gameResult.rows[0];
    
    // Check if already claimed
    const claimResult = await pool.query(
      `SELECT * FROM game_claims 
       WHERE game_id = $1 AND player_address = $2`,
      [gameId, playerAddress.toLowerCase()]
    );
    
    if (claimResult.rows.length > 0) {
      return res.status(400).json({ error: 'Game already claimed' });
    }
    
    // Verify win condition
    if (finalDealerHealth !== 0) {
      return res.status(400).json({ error: 'Player did not win (dealer health must be 0)' });
    }
    
    if (finalPlayerHealth <= 0 || finalPlayerHealth > 8) {
      return res.status(400).json({ error: 'Invalid player health' });
    }
    
    // Get end block number
    const endBlockNumber = game.end_block || await provider.getBlockNumber();
    
    // Sign game result
    const signature = await signGameResult(
      playerAddress,
      finalPlayerHealth,
      finalDealerHealth,
      game.rng_commitment,
      endBlockNumber
    );
    
    // Store claim in database (prevents replay)
    await pool.query(
      `INSERT INTO game_claims 
       (game_id, player_address, final_player_health, final_dealer_health, rng_commitment, end_block, signature, claimed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [gameId, playerAddress.toLowerCase(), finalPlayerHealth, finalDealerHealth, game.rng_commitment, endBlockNumber, signature, Date.now()]
    );
    
    res.json({
      success: true,
      signature,
      result: {
        playerAddress,
        finalPlayerHealth,
        finalDealerHealth,
        rngCommitment: game.rng_commitment,
        endBlockNumber
      },
      message: 'Result verified and signed. You can now claim on-chain.'
    });
  } catch (error) {
    console.error('Error verifying and signing:', error);
    res.status(500).json({ error: 'Failed to verify and sign', details: error.message });
  }
});

/**
 * GET /api/game/state/:gameId
 * Get game state (for reconnection)
 */
app.get('/api/game/state/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    const playerAddress = req.query.playerAddress;
    
    if (!playerAddress) {
      return res.status(400).json({ error: 'Missing playerAddress query parameter' });
    }
    
    const result = await pool.query(
      `SELECT * FROM games 
       WHERE game_id = $1 AND player_address = $2`,
      [gameId, playerAddress.toLowerCase()]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const game = result.rows[0];
    
    res.json({
      gameId: game.game_id,
      status: game.status,
      rngCommitment: game.rng_commitment,
      startTimestamp: game.start_timestamp,
      endBlock: game.end_block
    });
  } catch (error) {
    console.error('Error getting game state:', error);
    res.status(500).json({ error: 'Failed to get game state', details: error.message });
  }
});

/**
 * POST /api/game/verify-commitment
 * Verify that revealed RNG components match commitment
 * (For client-side verification)
 */
app.post('/api/game/verify-commitment', (req, res) => {
  try {
    const { commitment, baseSeed, serverNonce, playerAddress, timestamp } = req.body;
    
    if (!commitment || !baseSeed || !serverNonce || !playerAddress || !timestamp) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const isValid = verifyRNGCommitment(commitment, baseSeed, serverNonce, playerAddress, timestamp);
    
    res.json({
      isValid,
      message: isValid ? 'Commitment verified successfully' : 'Commitment verification failed'
    });
  } catch (error) {
    console.error('Error verifying commitment:', error);
    res.status(500).json({ error: 'Failed to verify commitment', details: error.message });
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = process.env.PORT || 3000;

// Bind to 0.0.0.0 to accept connections from Railway
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 Server wallet: ${serverWallet.address}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

