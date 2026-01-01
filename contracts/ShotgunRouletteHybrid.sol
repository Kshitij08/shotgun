// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// --- Pyth Entropy V2 Interfaces (Monad Testnet) ---
interface IEntropyV2 {
    function requestV2() external payable returns (uint64 sequenceNumber);
    function getFeeV2() external view returns (uint128 fee);
}

interface IEntropyConsumer {
    function _entropyCallback(
        uint64 sequenceNumber,
        address provider,
        bytes32 randomNumber
    ) external;
    function getEntropy() external view returns (address);
}

/**
 * @title ShotgunRouletteHybrid
 * @dev Hybrid approach combining:
 * 1. Commit-reveal RNG (prevents prediction)
 * 2. Server verification (prevents fake claims)
 * 3. DB tracking (prevents overspending)
 * 
 * ARCHITECTURE:
 * - Contract: Handles payments, stores commitments, verifies server signatures
 * - Server: Commits RNG, verifies results, signs claims, tracks in DB
 * - Client: Plays game using committed RNG, can verify after reveal
 */
contract ShotgunRouletteHybrid is IEntropyConsumer {
    address public owner;
    address public serverWallet; // Server wallet that signs game results
    
    // Game Economics
    uint256 public constant PLAY_FEE = 1 ether; // 1 MON
    uint256 public constant WIN_REWARD = 2 ether; // 2 MON
    uint256 public constant MAX_HEALTH = 8;
    
    IEntropyV2 public immutable entropy;
    
    // Game State
    struct GameSession {
        bool isActive;
        bool isPending;
        uint256 timestamp;
        bytes32 baseSeed; // Base seed from Pyth
        bytes32 rngCommitment; // Server's commitment to RNG (hash of RNG components)
    }
    
    // Track claims to prevent replay attacks (on-chain backup, server DB is primary)
    mapping(address => bool) public hasClaimed;
    mapping(bytes32 => bool) public usedRNGCommitments; // Prevent RNG reuse
    
    mapping(address => GameSession) public sessions;
    mapping(uint64 => address) public pendingRequests;
    
    // Events
    event GameRequested(address indexed player, uint64 sequenceNumber);
    event GameReady(address indexed player, bytes32 baseSeed);
    event RNGCommitted(address indexed player, bytes32 commitment);
    event RNGRevealed(address indexed player, bytes32 baseSeed, bytes32 serverNonce);
    event GameWon(address indexed player, uint256 reward, bytes32 rngCommitment);
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
        entropy = IEntropyV2(_entropyAddress);
        serverWallet = _serverWallet;
        require(_serverWallet != address(0), "Server wallet cannot be zero");
    }
    
    /**
     * @dev Start a new game
     * Same as before - gets seed from Pyth
     */
    function startGame() external payable {
        uint128 entropyFee = entropy.getFeeV2();
        uint256 totalCost = PLAY_FEE + entropyFee;
        
        require(msg.value >= totalCost, "Insufficient MON sent (Fee + Entropy cost)");
        require(
            address(this).balance + PLAY_FEE >= WIN_REWARD, 
            "Contract needs funding: send at least 1 MON to contract address"
        );

        // Clear old session
        if (sessions[msg.sender].isActive || sessions[msg.sender].isPending) {
            emit GameLost(msg.sender);
        }
        
        uint64 sequenceNumber = entropy.requestV2{value: entropyFee}();
        
        pendingRequests[sequenceNumber] = msg.sender;
        sessions[msg.sender] = GameSession({
            isActive: false,
            isPending: true,
            timestamp: block.timestamp,
            baseSeed: bytes32(0),
            rngCommitment: bytes32(0)
        });

        // Refund excess
        uint256 excess = msg.value - totalCost;
        if (excess > 0) {
            (bool success, ) = payable(msg.sender).call{value: excess}("");
            require(success, "Refund failed");
        }

        emit GameRequested(msg.sender, sequenceNumber);
    }

    /**
     * @dev Callback from Pyth Entropy V2 contract
     */
    function _entropyCallback(
        uint64 sequenceNumber,
        address /* provider */,
        bytes32 randomNumber
    ) external override onlyEntropy {
        address player = pendingRequests[sequenceNumber];
        require(player != address(0), "Invalid sequence number");
        
        sessions[player].isPending = false;
        sessions[player].isActive = true;
        sessions[player].baseSeed = randomNumber;
        
        delete pendingRequests[sequenceNumber];
        
        emit GameReady(player, randomNumber);
    }
    
    /**
     * @dev Store RNG commitment from server
     * Server commits to RNG before gameplay starts
     * Commitment = hash(baseSeed + serverSecret + serverNonce + playerAddress)
     * 
     * This prevents prediction because:
     * - Commitment is a hash (can't be reversed)
     * - Server secret is unknown
     * - Server nonce is random per game
     */
    function commitRNG(bytes32 commitment) external {
        GameSession storage session = sessions[msg.sender];
        require(session.isActive, "No active game");
        require(session.rngCommitment == bytes32(0), "RNG already committed");
        require(!usedRNGCommitments[commitment], "RNG commitment already used");
        
        session.rngCommitment = commitment;
        usedRNGCommitments[commitment] = true;
        
        emit RNGCommitted(msg.sender, commitment);
    }
    
    /**
     * @dev Reveal RNG components after game ends
     * Allows player to verify:
     * 1. Commitment matches revealed components
     * 2. Game outcomes match RNG
     * 
     * @param serverNonce The nonce used in RNG generation (revealed by server)
     * @param serverSecretHash Hash of server secret (for verification, actual secret stays hidden)
     */
    function revealRNG(
        bytes32 serverNonce,
        bytes32 serverSecretHash
    ) external {
        GameSession storage session = sessions[msg.sender];
        require(session.isActive, "No active game");
        require(session.rngCommitment != bytes32(0), "RNG not committed");
        
        // Verify commitment matches revealed components
        bytes32 computedCommitment = keccak256(abi.encodePacked(
            session.baseSeed,
            serverSecretHash,
            serverNonce,
            msg.sender
        ));
        
        require(
            computedCommitment == session.rngCommitment,
            "Revealed components don't match commitment"
        );
        
        emit RNGRevealed(msg.sender, session.baseSeed, serverNonce);
    }
    
    /**
     * @dev Claim reward when player wins
     * Server verifies result and signs it, then player calls this
     * 
     * @param finalPlayerHealth Final player health (must be > 0)
     * @param finalDealerHealth Final dealer health (must be 0 for win)
     * @param rngCommitment The RNG commitment used for this game
     * @param endBlockNumber Block number when game ended
     * @param signature Server signature of the game result
     * 
     * SECURITY:
     * - Requires valid signature from server wallet
     * - Server verifies result in DB before signing
     * - On-chain check prevents duplicate claims
     * - RNG commitment prevents replay attacks
     */
    function claimWin(
        uint8 finalPlayerHealth,
        uint8 finalDealerHealth,
        bytes32 rngCommitment,
        uint256 endBlockNumber,
        bytes memory signature
    ) external {
        GameSession storage session = sessions[msg.sender];
        require(session.isActive, "No active game");
        require(!session.isPending, "Game is still initializing");
        require(!hasClaimed[msg.sender], "Already claimed");
        require(session.rngCommitment == rngCommitment, "Invalid RNG commitment");
        
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
                rngCommitment,
                endBlockNumber
            ))
        ));
        
        address signer = recoverSigner(messageHash, signature);
        require(signer == serverWallet, "Invalid server signature");
        
        // Mark as claimed (prevents replay)
        hasClaimed[msg.sender] = true;
        session.isActive = false;
        
        // Transfer reward
        (bool success, ) = payable(msg.sender).call{value: WIN_REWARD}("");
        require(success, "Transfer failed");
        
        emit GameWon(msg.sender, WIN_REWARD, rngCommitment);
    }
    
    /**
     * @dev Recover signer from signature
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
        
        if (v < 27) {
            v += 27;
        }
        
        require(v == 27 || v == 28, "Invalid signature v value");
        
        return ecrecover(messageHash, v, r, s);
    }
    
    /**
     * @dev End game manually (player lost)
     */
    function endGame() external {
        if (sessions[msg.sender].isActive) {
            sessions[msg.sender].isActive = false;
            emit GameLost(msg.sender);
        }
    }
    
    // --- View Functions ---
    
    function getEntropy() external view override returns (address) {
        return address(entropy);
    }
    
    function getEntropyFee() public view returns (uint256) {
        return uint256(entropy.getFeeV2());
    }
    
    function hasActiveGame(address player) external view returns (bool) {
        return sessions[player].isActive;
    }
    
    function isGamePending(address player) external view returns (bool) {
        return sessions[player].isPending;
    }
    
    function getBaseSeed(address player) external view returns (bytes32) {
        return sessions[player].baseSeed;
    }
    
    function getRNGCommitment(address player) external view returns (bytes32) {
        return sessions[player].rngCommitment;
    }
    
    function canStartGame() external view returns (bool) {
        return address(this).balance + PLAY_FEE >= WIN_REWARD;
    }
    
    function getMinRequiredBalance() external pure returns (uint256) {
        return WIN_REWARD - PLAY_FEE;
    }

    // --- Admin Functions ---
    
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

