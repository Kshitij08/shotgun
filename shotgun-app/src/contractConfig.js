// Contract ABI for ShotgunRoulette (Server-Based Version)
export const SHOTGUN_ROULETTE_ABI = [
  "function startGame() external payable",
  "function claimWin(uint8 finalPlayerHealth, uint8 finalDealerHealth, bytes32 gameSeed, uint256 endBlockNumber, bytes memory signature) external",
  "function endGame() external",
  "function hasActiveGame(address) external view returns (bool)",
  "function isGamePending(address) external view returns (bool)",
  "function getBaseSeed(address) external view returns (bytes32)",
  "function getEntropyFee() external view returns (uint256)",
  "function PLAY_FEE() external view returns (uint256)",
  "function WIN_REWARD() external view returns (uint256)",
  "function entropy() external view returns (address)",
  "function getEntropy() external view returns (address)",
  "function canStartGame() external view returns (bool)",
  "function getMinRequiredBalance() external view returns (uint256)",
  "function serverWallet() external view returns (address)",
  "event GameRequested(address indexed player, uint64 sequenceNumber)",
  "event GameReady(address indexed player, bytes32 baseSeed)",
  "event GameWon(address indexed player, uint256 reward, bytes32 gameSeed)",
  "event GameLost(address indexed player)"
];

// Contract address - UPDATE THIS AFTER DEPLOYMENT
// For now, this is a placeholder. You'll need to deploy the contract and update this address
export const CONTRACT_ADDRESS = "0x7ba8f65f3D0757aF159d3cf49CD3034F61411504";

// Server URL - UPDATE THIS
export const SERVER_URL = "https://shotgun-production.up.railway.app";

// Contract configuration
export const CONTRACT_CONFIG = {
  address: CONTRACT_ADDRESS,
  abi: SHOTGUN_ROULETTE_ABI,
  playFee: "1.0", // 1 MON
  winReward: "2.0" // 2 MON
};

