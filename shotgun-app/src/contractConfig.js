// Contract ABI for ShotgunRoulette
export const SHOTGUN_ROULETTE_ABI = [
  "function startGame() external payable",
  "function claimWin() external",
  "function endGame() external",
  "function hasActiveGame(address) external view returns (bool)",
  "function getBalance() external view returns (uint256)",
  "function PLAY_FEE() external view returns (uint256)",
  "function WIN_REWARD() external view returns (uint256)",
  "event GameStarted(address indexed player, uint256 timestamp)",
  "event GameWon(address indexed player, uint256 reward)",
  "event GameLost(address indexed player)"
];

// Contract address - UPDATE THIS AFTER DEPLOYMENT
// For now, this is a placeholder. You'll need to deploy the contract and update this address
export const CONTRACT_ADDRESS = "0x7828D6a6C2B05AAa85D9Ae50F50D96e1681944c1";

// Contract configuration
export const CONTRACT_CONFIG = {
  address: CONTRACT_ADDRESS,
  abi: SHOTGUN_ROULETTE_ABI,
  playFee: "1.0", // 1 MON
  winReward: "2.0" // 2 MON
};

