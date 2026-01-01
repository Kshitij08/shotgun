// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// --- Pyth Entropy V2 Interfaces (Monad Testnet) ---
// Based on working implementations from just-risk-it and FateboundBreach

interface IEntropyV2 {
    /**
     * @notice Request randomness (simplest form - uses default provider)
     * @return sequenceNumber Unique identifier for this request
     */
    function requestV2() external payable returns (uint64 sequenceNumber);
    
    /**
     * @notice Get the fee required for a randomness request
     * @return fee The fee in wei
     */
    function getFeeV2() external view returns (uint128 fee);
}

interface IEntropyConsumer {
    /**
     * @notice Called by Entropy contract with the random number
     * @param sequenceNumber The sequence number from the request
     * @param provider The provider that generated the randomness
     * @param randomNumber The random number generated
     */
    function _entropyCallback(
        uint64 sequenceNumber,
        address provider,
        bytes32 randomNumber
    ) external;
    
    /**
     * @notice Returns the address of the entropy contract
     * @dev Required by IEntropyConsumer interface
     */
    function getEntropy() external view returns (address);
}

/**
 * @title ShotgunRoulette
 * @dev Smart contract for Shotgun Roulette game with Pyth Entropy
 * Charges 1 MON + Entropy Fee to play, rewards 2 MON on win.
 */
contract ShotgunRoulette is IEntropyConsumer {
    address public owner;
    
    // Game Economics
    uint256 public constant PLAY_FEE = 1 ether; // 1 MON
    uint256 public constant WIN_REWARD = 2 ether; // 2 MON
    
    // Pyth Entropy V2 Config (Monad Testnet)
    // Verified working address from FateboundBreach: 0x825c0390f379C631f3Cf11A82a37D20BddF93c07
    // Alternative: 0x36825bf3Fbdf5a29E2d5148bfe7Dcf7B5639e320 (from docs)
    IEntropyV2 public immutable entropy;

    // Game State
    struct GameSession {
        bool isActive;
        bool isPending; // Waiting for entropy callback
        uint256 timestamp;
        bytes32 gameSeed; // The secure random seed from Pyth
    }
    
    mapping(address => GameSession) public sessions;
    mapping(uint64 => address) public pendingRequests; // Maps sequenceNumber -> player address
    
    // Events
    event GameRequested(address indexed player, uint64 sequenceNumber);
    event GameReady(address indexed player, bytes32 seed);
    event GameWon(address indexed player, uint256 reward);
    event GameLost(address indexed player);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    modifier onlyEntropy() {
        require(msg.sender == address(entropy), "Only Entropy contract can call");
        _;
    }
    
    constructor(address _entropyAddress) {
        owner = msg.sender;
        // Initialize Entropy V2 contract (uses default provider automatically)
        entropy = IEntropyV2(_entropyAddress);
    }
    
    /**
     * @dev Start a new game. 
     * Requires: 1 MON (Play Fee) + Entropy Fee (dynamic)
     */
    function startGame() external payable {
        // 1. Get Entropy Fee (V2 - no provider needed, uses default)
        uint128 entropyFee = entropy.getFeeV2();
        uint256 totalCost = PLAY_FEE + entropyFee;
        
        require(msg.value >= totalCost, "Insufficient MON sent (Fee + Entropy cost)");
        // Check if contract will have enough balance after receiving payment to pay out reward
        require(
            address(this).balance + PLAY_FEE >= WIN_REWARD, 
            "Contract needs funding: send at least 1 MON to contract address"
        );

        // 2. Clear old session
        if (sessions[msg.sender].isActive || sessions[msg.sender].isPending) {
            emit GameLost(msg.sender); // Auto-forfeit if restarting
        }
        
        // 3. Request Entropy V2 (no provider or userRandomNumber needed)
        uint64 sequenceNumber = entropy.requestV2{value: entropyFee}();
        
        // 4. Update State
        pendingRequests[sequenceNumber] = msg.sender;
        sessions[msg.sender] = GameSession({
            isActive: false,
            isPending: true,
            timestamp: block.timestamp,
            gameSeed: bytes32(0)
        });

        // 5. Refund excess (if any)
        uint256 excess = msg.value - totalCost;
        if (excess > 0) {
            (bool success, ) = payable(msg.sender).call{value: excess}("");
            require(success, "Refund failed");
        }

        emit GameRequested(msg.sender, sequenceNumber);
    }

    /**
     * @dev Callback from Pyth Entropy V2 contract
     * @notice This is called by the Entropy contract when randomness is ready
     */
    function _entropyCallback(
        uint64 sequenceNumber,
        address /* provider */,
        bytes32 randomNumber
    ) external override onlyEntropy {
        address player = pendingRequests[sequenceNumber];
        require(player != address(0), "Invalid sequence number");
        
        // Finalize Game Setup
        sessions[player].isPending = false;
        sessions[player].isActive = true;
        sessions[player].gameSeed = randomNumber;
        
        delete pendingRequests[sequenceNumber];
        
        emit GameReady(player, randomNumber);
    }
    
    /**
     * @dev Required by IEntropyConsumer interface
     * @return The address of the entropy contract
     */
    function getEntropy() external view override returns (address) {
        return address(entropy);
    }
    
    /**
     * @dev Claim reward when player wins
     */
    function claimWin() external {
        GameSession storage session = sessions[msg.sender];
        require(session.isActive, "No active game");
        require(!session.isPending, "Game is still initializing");
        
        session.isActive = false;
        
        (bool success, ) = payable(msg.sender).call{value: WIN_REWARD}("");
        require(success, "Transfer failed");
        
        emit GameWon(msg.sender, WIN_REWARD);
    }
    
    /**
     * @dev End game manually
     */
    function endGame() external {
        if (sessions[msg.sender].isActive) {
            sessions[msg.sender].isActive = false;
            emit GameLost(msg.sender);
        }
    }

    // --- View Functions ---

    function getEntropyFee() public view returns (uint256) {
        // V2: getFeeV2() - no provider needed, uses default
        return uint256(entropy.getFeeV2());
    }
    
    function hasActiveGame(address player) external view returns (bool) {
        return sessions[player].isActive;
    }
    
    function isGamePending(address player) external view returns (bool) {
        return sessions[player].isPending;
    }
    
    /**
     * @dev Get the game seed for a player's active game
     * @param player The player address
     * @return seed The game seed (bytes32(0) if not ready)
     */
    function getGameSeed(address player) external view returns (bytes32) {
        return sessions[player].gameSeed;
    }
    
    /**
     * @dev Check if contract has sufficient funds to start a game
     */
    function canStartGame() external view returns (bool) {
        return address(this).balance + PLAY_FEE >= WIN_REWARD;
    }
    
    /**
     * @dev Get the minimum balance needed for contract to accept games
     */
    function getMinRequiredBalance() external pure returns (uint256) {
        return WIN_REWARD - PLAY_FEE; // 1 MON
    }

    // --- Admin ---
    // Note: V2 uses default provider automatically, no config needed
    
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds");
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    receive() external payable {}
}
