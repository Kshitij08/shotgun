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
 * @dev Smart contract for Shotgun Roulette game with Pyth Entropy and Server Verification
 * Charges 1 MON + Entropy Fee to play, rewards 2 MON on win.
 * 
 * SECURITY FEATURES:
 * - Server signature required for claimWin() - prevents unauthorized withdrawals
 * - Server processes baseSeed with secret - prevents game outcome prediction
 * 
 * DEPLOYMENT (Remix):
 * Constructor: (_entropyAddress, _serverWallet)
 * - _entropyAddress: 0x825c0390f379C631f3Cf11A82a37D20BddF93c07 (Monad Testnet)
 * - _serverWallet: 0x511950a2aef8707f3e5D9A7482a1cE7BE6F3bf27 (Your Railway server wallet)
 */
contract ShotgunRoulette is IEntropyConsumer {
    address public owner;
    address public serverWallet; // Server wallet that signs game results
    
    // Game Economics
    uint256 public constant PLAY_FEE = 1 ether; // 1 MON
    uint256 public constant WIN_REWARD = 2 ether; // 2 MON
    uint256 public constant MAX_HEALTH = 8;
    
    // Pyth Entropy V2 Config (Monad Testnet)
    // Verified working address from FateboundBreach: 0x825c0390f379C631f3Cf11A82a37D20BddF93c07
    // Alternative: 0x36825bf3Fbdf5a29E2d5148bfe7Dcf7B5639e320 (from docs)
    IEntropyV2 public immutable entropy;

    // Game State
    struct GameSession {
        bool isActive;
        bool isPending; // Waiting for entropy callback
        uint256 timestamp;
        bytes32 baseSeed; // Base seed from Pyth (server will process this with secret)
    }
    
    mapping(address => GameSession) public sessions;
    mapping(uint64 => address) public pendingRequests; // Maps sequenceNumber -> player address
    
    // Events
    event GameRequested(address indexed player, uint64 sequenceNumber);
    event GameReady(address indexed player, bytes32 baseSeed);
    event GameWon(address indexed player, uint256 reward, bytes32 gameSeed);
    event GameLost(address indexed player);
    event ServerWalletUpdated(address indexed oldWallet, address indexed newWallet);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    modifier onlyEntropy() {
        require(msg.sender == address(entropy), "Only Entropy contract can call");
        _;
    }
    
    constructor(address _entropyAddress, address _serverWallet) {
        owner = msg.sender;
        // Initialize Entropy V2 contract (uses default provider automatically)
        entropy = IEntropyV2(_entropyAddress);
        serverWallet = _serverWallet;
        require(_serverWallet != address(0), "Server wallet cannot be zero");
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
            baseSeed: bytes32(0)
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
        sessions[player].baseSeed = randomNumber; // Base seed - server will process this with secret
        
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
     * @param finalPlayerHealth Final player health (must be > 0)
     * @param finalDealerHealth Final dealer health (must be 0 for win)
     * @param gameSeed The processed game seed from server (for verification/audit)
     * @param endBlockNumber Block number when game ended
     * @param signature Server signature of the game result
     * 
     * SECURITY:
     * - Requires valid signature from server wallet
     * - Server signs: playerAddress + finalPlayerHealth + finalDealerHealth + gameSeed + endBlockNumber
     * - Prevents unauthorized withdrawals (can't claim without server signature)
     * - Prevents prediction (server processes seed with secret, making it unpredictable)
     */
    function claimWin(
        uint8 finalPlayerHealth,
        uint8 finalDealerHealth,
        bytes32 gameSeed,
        uint256 endBlockNumber,
        bytes memory signature
    ) external {
        GameSession storage session = sessions[msg.sender];
        require(session.isActive, "No active game");
        require(!session.isPending, "Game is still initializing");
        
        // Verify win condition
        require(finalDealerHealth == 0, "Player did not win: dealer health must be 0");
        require(finalPlayerHealth > 0, "Player must be alive to claim win");
        require(finalPlayerHealth <= MAX_HEALTH, "Invalid player health");
        
        // Verify signature from server
        bytes32 messageHash = keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            keccak256(abi.encodePacked(
                msg.sender,
                finalPlayerHealth,
                finalDealerHealth,
                gameSeed,
                endBlockNumber
            ))
        ));
        
        address signer = recoverSigner(messageHash, signature);
        require(signer == serverWallet, "Invalid server signature");
        
        // Deactivate session
        session.isActive = false;
        
        // Transfer reward
        (bool success, ) = payable(msg.sender).call{value: WIN_REWARD}("");
        require(success, "Transfer failed");
        
        emit GameWon(msg.sender, WIN_REWARD, gameSeed);
    }
    
    /**
     * @dev Recover signer from signature (EIP-191)
     */
    function recoverSigner(bytes32 messageHash, bytes memory signature) 
        internal 
        pure 
        returns (address) 
    {
        require(signature.length == 65, "Invalid signature length");
        
        bytes32 r;
        bytes32 s;
        uint8 v;
        
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }
        
        // Adjust v (27 or 28) to 0 or 1
        if (v < 27) {
            v += 27;
        }
        
        require(v == 27 || v == 28, "Invalid signature v value");
        
        return ecrecover(messageHash, v, r, s);
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
     * @dev Get the base seed for a player's active game
     * @param player The player address
     * @return seed The base seed (bytes32(0) if not ready)
     * @notice Server will use this to generate the actual game seed
     */
    function getBaseSeed(address player) external view returns (bytes32) {
        return sessions[player].baseSeed;
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

    // --- Admin Functions ---
    
    /**
     * @dev Update server wallet address
     * @notice Only owner can update, use with caution
     */
    function setServerWallet(address _newServerWallet) external onlyOwner {
        require(_newServerWallet != address(0), "Server wallet cannot be zero");
        address oldWallet = serverWallet;
        serverWallet = _newServerWallet;
        emit ServerWalletUpdated(oldWallet, _newServerWallet);
    }
    
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds");
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    receive() external payable {}
}
