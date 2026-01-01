// Contract ABI for ShotgunRoulette
export const SHOTGUN_ROULETTE_ABI = [
  "function startGame() external payable",
  "function claimWin() external",
  "function endGame() external",
  "function hasActiveGame(address) external view returns (bool)",
  "function isGamePending(address) external view returns (bool)",
  "function getGameSeed(address) external view returns (bytes32)",
  "function getEntropyFee() external view returns (uint256)",
  "function getBalance() external view returns (uint256)",
  "function PLAY_FEE() external view returns (uint256)",
  "function WIN_REWARD() external view returns (uint256)",
  "function entropy() external view returns (address)",
  "function getEntropy() external view returns (address)",
  "function canStartGame() external view returns (bool)",
  "function getMinRequiredBalance() external view returns (uint256)",
  "event GameRequested(address indexed player, uint64 sequenceNumber)",
  "event GameReady(address indexed player, bytes32 seed)",
  "event GameWon(address indexed player, uint256 reward)",
  "event GameLost(address indexed player)"
];

// Contract address - UPDATE THIS AFTER DEPLOYMENT
// For now, this is a placeholder. You'll need to deploy the contract and update this address
export const CONTRACT_ADDRESS = "0xF282FD3903F70E4c4bed148723efB1d0fa20Bc40";

// Contract configuration
export const CONTRACT_CONFIG = {
  address: CONTRACT_ADDRESS,
  abi: SHOTGUN_ROULETTE_ABI,
  playFee: "1.0", // 1 MON
  winReward: "2.0" // 2 MON
};

