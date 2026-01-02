/**
 * RNG Verification Utilities
 * 
 * Allows players to verify the RNG commitment after a game ends.
 * Note: Full verification requires server secret, but we can verify:
 * - Base seed matches contract
 * - Commitment structure is valid
 * - Components are consistent
 */

import { ethers } from 'ethers';

/**
 * Verify that the base seed matches what's stored in the contract
 * @param {string} baseSeed - Base seed from server
 * @param {string} contractAddress - Contract address
 * @param {string} playerAddress - Player address
 * @param {ethers.Contract} contract - Contract instance
 * @returns {Promise<boolean>} - True if base seed matches
 */
export async function verifyBaseSeed(baseSeed, contractAddress, playerAddress, contract) {
  try {
    const contractBaseSeed = await contract.getBaseSeed(playerAddress);
    return contractBaseSeed.toLowerCase() === baseSeed.toLowerCase();
  } catch (error) {
    console.error('Error verifying base seed:', error);
    return false;
  }
}

/**
 * Compute what the commitment should be (without server secret)
 * This shows the structure but can't fully verify without server secret
 * @param {string} baseSeed - Base seed
 * @param {string} serverNonce - Server nonce (revealed after game ends)
 * @param {string} playerAddress - Player address
 * @param {number} timestamp - Start timestamp
 * @returns {object} - Commitment structure info
 */
export function analyzeCommitmentStructure(baseSeed, serverNonce, playerAddress, timestamp) {
  try {
    // Note: We can't compute the full commitment without server secret hash
    // But we can show the structure and verify components are valid
    
    const components = {
      baseSeed: {
        value: baseSeed,
        isValid: ethers.isHexString(baseSeed, 32),
        description: 'Base seed from Pyth Entropy (on-chain)'
      },
      serverNonce: {
        value: serverNonce,
        isValid: ethers.isHexString(serverNonce, 32),
        description: 'Server nonce (revealed after game ends)'
      },
      playerAddress: {
        value: playerAddress,
        isValid: ethers.isAddress(playerAddress),
        description: 'Player wallet address'
      },
      timestamp: {
        value: timestamp,
        isValid: typeof timestamp === 'number' && timestamp > 0 && !isNaN(timestamp),
        description: 'Game start timestamp (milliseconds)',
        readable: (timestamp > 0 && !isNaN(timestamp)) 
          ? new Date(timestamp).toISOString() 
          : `Invalid timestamp: ${timestamp}`
      }
    };
    
    // Compute hash of components (without server secret)
    // This shows what goes into the commitment
    const componentsHash = ethers.keccak256(
      ethers.solidityPacked(
        ['bytes32', 'bytes32', 'address', 'uint256'],
        [baseSeed, serverNonce, playerAddress, timestamp]
      )
    );
    
    return {
      components,
      componentsHash,
      allValid: Object.values(components).every(c => c.isValid),
      note: 'Full commitment includes server secret hash (not revealed for security)'
    };
  } catch (error) {
    console.error('Error analyzing commitment:', error);
    return null;
  }
}

/**
 * Verify RNG components are consistent
 * @param {object} rngData - RNG data from server
 * @param {string} playerAddress - Player address
 * @returns {object} - Verification results
 */
export function verifyRNGComponents(rngData, playerAddress) {
  const { rngCommitment, baseSeed, serverNonce, startTimestamp } = rngData;
  
  const analysis = analyzeCommitmentStructure(
    baseSeed,
    serverNonce,
    playerAddress,
    startTimestamp
  );
  
  if (!analysis) {
    return {
      isValid: false,
      error: 'Failed to analyze commitment structure'
    };
  }
  
  // Verify commitment format
  const commitmentValid = ethers.isHexString(rngCommitment, 32);
  
  // Check timestamp is reasonable (not in future, not too old)
  const now = Date.now();
  const timestampValid = startTimestamp > 0 && 
                         startTimestamp <= now && 
                         startTimestamp > now - (7 * 24 * 60 * 60 * 1000); // Within last 7 days
  
  return {
    isValid: analysis.allValid && commitmentValid && timestampValid,
    commitmentValid,
    timestampValid,
    componentsValid: analysis.allValid,
    analysis,
    rngCommitment,
    message: commitmentValid && analysis.allValid && timestampValid
      ? '✅ RNG components are valid and consistent'
      : '⚠️ Some RNG components failed verification'
  };
}

/**
 * Format RNG data for display
 * @param {object} rngData - RNG data from server
 * @returns {object} - Formatted data
 */
export function formatRNGData(rngData) {
  return {
    gameId: rngData.gameId,
    baseSeed: {
      full: rngData.baseSeed,
      short: `${rngData.baseSeed.slice(0, 10)}...${rngData.baseSeed.slice(-8)}`
    },
    rngCommitment: {
      full: rngData.rngCommitment,
      short: `${rngData.rngCommitment.slice(0, 10)}...${rngData.rngCommitment.slice(-8)}`
    },
    serverNonce: {
      full: rngData.serverNonce,
      short: `${rngData.serverNonce.slice(0, 10)}...${rngData.serverNonce.slice(-8)}`
    },
    startTimestamp: {
      raw: rngData.startTimestamp,
      readable: new Date(rngData.startTimestamp).toLocaleString(),
      relative: getRelativeTime(rngData.startTimestamp)
    },
    endBlockNumber: rngData.endBlockNumber
  };
}

/**
 * Get relative time string
 */
function getRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
}

