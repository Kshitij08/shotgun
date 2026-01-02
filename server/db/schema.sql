-- Database Schema for Shotgun Roulette Server
-- Run this in your Railway PostgreSQL database

-- Games table: Stores active and completed games
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(64) UNIQUE NOT NULL,
    player_address VARCHAR(42) NOT NULL,
    base_seed VARCHAR(66) NOT NULL, -- bytes32 hex string
    rng_commitment VARCHAR(66) NOT NULL, -- bytes32 hex string
    server_nonce VARCHAR(66) NOT NULL, -- bytes32 hex string
    start_block BIGINT NOT NULL,
    start_timestamp BIGINT NOT NULL,
    end_block BIGINT,
    end_timestamp BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'ended', 'claimed'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Game claims table: Tracks all reward claims (prevents overspending)
CREATE TABLE IF NOT EXISTS game_claims (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(64) NOT NULL,
    player_address VARCHAR(42) NOT NULL,
    final_player_health INT NOT NULL,
    final_dealer_health INT NOT NULL,
    rng_commitment VARCHAR(66) NOT NULL,
    end_block BIGINT NOT NULL,
    signature TEXT NOT NULL,
    tx_hash VARCHAR(66), -- On-chain transaction hash (optional)
    claimed_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(game_id, player_address), -- Prevent duplicate claims per game
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_games_player_address ON games(player_address);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_rng_commitment ON games(rng_commitment);
CREATE INDEX IF NOT EXISTS idx_game_claims_player_address ON game_claims(player_address);
CREATE INDEX IF NOT EXISTS idx_game_claims_rng_commitment ON game_claims(rng_commitment);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View for active games
CREATE OR REPLACE VIEW active_games AS
SELECT 
    game_id,
    player_address,
    rng_commitment,
    start_block,
    start_timestamp,
    status
FROM games
WHERE status = 'active';

-- View for completed games with claims
CREATE OR REPLACE VIEW completed_games_with_claims AS
SELECT 
    g.game_id,
    g.player_address,
    g.rng_commitment,
    g.start_timestamp,
    g.end_timestamp,
    gc.final_player_health,
    gc.final_dealer_health,
    gc.claimed_at,
    gc.tx_hash
FROM games g
LEFT JOIN game_claims gc ON g.game_id = gc.game_id
WHERE g.status = 'ended' OR g.status = 'claimed';

