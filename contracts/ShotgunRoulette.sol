// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ShotgunRoulette
 * @dev Smart contract for Shotgun Roulette game
 * Charges 1 MON to play, rewards 2 MON on win
 */
contract ShotgunRoulette {
    address public owner;
    uint256 public constant PLAY_FEE = 1 ether; // 1 MON
    uint256 public constant WIN_REWARD = 2 ether; // 2 MON
    
    mapping(address => bool) public activeGames;
    mapping(address => uint256) public gameStartTime;
    
    event GameStarted(address indexed player, uint256 timestamp);
    event GameWon(address indexed player, uint256 reward);
    event GameLost(address indexed player);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Start a new game by paying the play fee
     * Automatically clears any previous active game for the player
     */
    function startGame() external payable {
        require(msg.value == PLAY_FEE, "Must pay exactly 1 MON to play");
        require(address(this).balance >= WIN_REWARD, "Contract insufficient funds");
        
        // Automatically clear previous game if one exists (no need for endGame() call)
        if (activeGames[msg.sender]) {
            activeGames[msg.sender] = false;
            emit GameLost(msg.sender);
        }
        
        activeGames[msg.sender] = true;
        gameStartTime[msg.sender] = block.timestamp;
        
        emit GameStarted(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Claim reward when player wins
     */
    function claimWin() external {
        require(activeGames[msg.sender], "No active game");
        require(address(this).balance >= WIN_REWARD, "Contract insufficient funds");
        
        activeGames[msg.sender] = false;
        
        (bool success, ) = payable(msg.sender).call{value: WIN_REWARD}("");
        require(success, "Transfer failed");
        
        emit GameWon(msg.sender, WIN_REWARD);
    }
    
    /**
     * @dev End game without reward (player lost)
     */
    function endGame() external {
        require(activeGames[msg.sender], "No active game");
        
        activeGames[msg.sender] = false;
        
        emit GameLost(msg.sender);
    }
    
    /**
     * @dev Withdraw contract balance (owner only)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Deposit funds to contract (for rewards)
     */
    function deposit() external payable {
        require(msg.value > 0, "Must send some MON");
    }
    
    /**
     * @dev Get contract balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Check if player has active game
     */
    function hasActiveGame(address player) external view returns (bool) {
        return activeGames[player];
    }
    
    // Allow contract to receive ETH
    receive() external payable {}
}

