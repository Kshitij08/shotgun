# Security Audit Report: Shotgun Roulette Game

**Date:** 2024  
**Auditor:** Security Review  
**Contract:** `ShotgunRoulette.sol`  
**Client Code:** `shotgun-app/src/App.jsx`

---

## Executive Summary

This audit identified **CRITICAL** security vulnerabilities that allow:
1. **Unauthorized fund withdrawal** - Anyone with an active game can claim rewards without winning
2. **Complete game outcome prediction** - Players can predict the entire game before playing and only start games they know they'll win

These vulnerabilities make the game **completely exploitable** and could result in total loss of contract funds.

---

## 🔴 CRITICAL VULNERABILITIES

### 1. No Win Verification in `claimWin()` Function

**Severity:** CRITICAL  
**Location:** `contracts/ShotgunRoulette.sol:167-178`

**Issue:**
The `claimWin()` function does not verify that the player actually won the game. It only checks:
- If the player has an active game (`session.isActive`)
- If the game is not pending (`!session.isPending`)

**Vulnerable Code:**
```solidity
function claimWin() external {
    GameSession storage session = sessions[msg.sender];
    require(session.isActive, "No active game");
    require(!session.isPending, "Game is still initializing");
    
    session.isActive = false;
    
    (bool success, ) = payable(msg.sender).call{value: WIN_REWARD}("");
    require(success, "Transfer failed");
    
    emit GameWon(msg.sender, WIN_REWARD);
}
```

**Exploit:**
1. Player calls `startGame()` and pays 1 MON + entropy fee
2. Wait for entropy callback to activate the game
3. Immediately call `claimWin()` without playing
4. Receive 2 MON reward (net profit: ~1 MON per exploit)

**Impact:**
- Any player with an active game can drain the contract
- Contract will lose 1 MON per exploit (2 MON paid out - 1 MON received)
- No way to prevent this without fixing the contract

**Recommendation:**
The contract must verify the win condition on-chain. Options:
1. **Commit-reveal scheme:** Player commits to moves, contract verifies outcome
2. **On-chain game logic:** Move all game logic to the contract
3. **Oracle verification:** Use an oracle to verify game outcomes
4. **Merkle proof:** Player submits merkle proof of win, contract verifies

---

### 2. Predictable Game Outcome (Seed is Public)

**Severity:** CRITICAL  
**Location:** `contracts/ShotgunRoulette.sol:210-212`, `shotgun-app/src/App.jsx:671-685`

**Issue:**
The game seed is stored publicly in the contract and can be read by anyone via `getGameSeed()`. Since the game uses deterministic RNG (mulberry32), anyone can:
1. Read the seed from the contract
2. Run the same game logic locally
3. Predict the entire game outcome before playing
4. Only start games where they know they'll win

**Vulnerable Code:**
```solidity
function getGameSeed(address player) external view returns (bytes32) {
    return sessions[player].gameSeed;  // Publicly readable!
}
```

**Client-side RNG:**
```javascript
const reseed = (seedVal) => {
    // Uses only first 8 hex chars (32 bits) - reduces entropy
    const hexStr = seedVal.startsWith('0x') ? seedVal.slice(2) : seedVal;
    seedInt = parseInt(hexStr.slice(0, 8), 16);
    rngSeedRef.current = seedInt >>> 0;
    rngRef.current = mulberry32(seedInt);  // Deterministic RNG
};
```

**Exploit:**
1. Monitor contract for new `GameReady` events
2. Read the seed from the contract: `getGameSeed(playerAddress)`
3. Run the game simulation locally with the same seed
4. If the simulation shows a win, start playing
5. If the simulation shows a loss, don't play (or use a different account)
6. Repeat until profitable

**Additional Issues:**
- Only uses first 8 hex characters (32 bits) of the 256-bit seed, reducing entropy
- Game logic is entirely client-side and deterministic
- No commitment scheme - seed is revealed before gameplay

**Impact:**
- Players can achieve 100% win rate by only playing favorable games
- Contract will be exploited by sophisticated players
- Honest players will face unfair competition

**Recommendation:**
1. **Commit-reveal scheme:** Player commits to playing before seed is revealed
2. **On-chain verification:** Move game logic to contract so outcome is verifiable
3. **Delayed seed revelation:** Reveal seed only after game completion
4. **Use full seed:** Use all 256 bits of the seed, not just 32 bits

---

## 🟡 HIGH SEVERITY ISSUES

### 3. Balance Check Race Condition

**Severity:** HIGH  
**Location:** `contracts/ShotgunRoulette.sol:102-105`

**Issue:**
The balance check in `startGame()` doesn't account for concurrent games. Multiple players could start games simultaneously, and the contract might not have enough funds to pay all winners.

**Vulnerable Code:**
```solidity
require(
    address(this).balance + PLAY_FEE >= WIN_REWARD, 
    "Contract needs funding: send at least 1 MON to contract address"
);
```

**Exploit:**
1. Contract has 1.5 MON balance (enough for 1 game)
2. Two players call `startGame()` in the same block
3. Both pass the balance check (1.5 + 1 = 2.5 >= 2)
4. Both games activate
5. If both win, contract can only pay one (insufficient funds)

**Impact:**
- Winners might not be able to claim rewards
- Contract could become insolvent

**Recommendation:**
- Track reserved funds for active games
- Use a more conservative balance check: `address(this).balance + PLAY_FEE >= WIN_REWARD * (activeGames + 1)`

---

### 4. Reentrancy Risk in Refund Logic

**Severity:** MEDIUM  
**Location:** `contracts/ShotgunRoulette.sol:124-129`

**Issue:**
The refund uses `call()` which could potentially be exploited if the recipient is a contract. However, state is updated before the call, so this is less critical.

**Code:**
```solidity
uint256 excess = msg.value - totalCost;
if (excess > 0) {
    (bool success, ) = payable(msg.sender).call{value: excess}("");
    require(success, "Refund failed");
}
```

**Recommendation:**
- Use `send()` or `transfer()` for refunds (gas limit prevents reentrancy)
- Or use Checks-Effects-Interactions pattern (already done, but could be improved)

---

## 🟢 MEDIUM/LOW SEVERITY ISSUES

### 5. Client-Side Game Logic

**Severity:** MEDIUM  
**Location:** `shotgun-app/src/App.jsx` (entire game logic)

**Issue:**
All game logic runs client-side. While the seed is on-chain, the game execution is not verified.

**Impact:**
- Players could modify client code (though seed determinism limits this)
- No way to prove game fairness without on-chain verification

**Recommendation:**
- Move critical game logic to the contract
- Or implement a commit-reveal scheme with on-chain verification

---

### 6. No Maximum Game Duration

**Severity:** LOW  
**Location:** `contracts/ShotgunRoulette.sol:59-64`

**Issue:**
Games can remain active indefinitely. A player could start a game and never complete it, blocking that session slot.

**Impact:**
- Minor DoS if many players abandon games
- Funds locked in active sessions

**Recommendation:**
- Add timeout mechanism
- Allow auto-forfeit after X blocks

---

### 7. Owner Can Drain Contract

**Severity:** LOW (By Design)  
**Location:** `contracts/ShotgunRoulette.sol:231-236`

**Issue:**
Owner can withdraw all funds at any time via `withdraw()`.

**Note:** This appears to be by design for contract management, but should be documented.

**Recommendation:**
- Consider adding timelock or multi-sig for withdrawals
- Or separate owner funds from game funds

---

## Summary of Recommendations

### Immediate Actions Required:

1. **Fix `claimWin()` verification** - This is the most critical issue
2. **Implement commit-reveal scheme** - Prevent seed prediction
3. **Add balance tracking** - Prevent race conditions
4. **Move game logic on-chain** - Or implement proper verification

### Architecture Changes Needed:

The current architecture has a fundamental flaw: **the contract doesn't verify game outcomes**. This must be fixed before the contract can be safely deployed.

**Recommended Approach:**
1. Player commits to playing (pays fee)
2. Contract generates seed and stores it
3. Player plays game (client-side for UX)
4. Player submits game result + proof
5. Contract verifies result on-chain using the seed
6. Contract pays reward if verified

This maintains good UX while ensuring security.

---

## Testing Recommendations

1. **Fuzz testing:** Test `claimWin()` with various game states
2. **Simulation testing:** Test seed prediction with known seeds
3. **Concurrency testing:** Test multiple simultaneous games
4. **Economic testing:** Model profitability of exploits

---

## Conclusion

The contract has **critical vulnerabilities** that make it completely exploitable. **DO NOT DEPLOY** without fixing these issues. The game can be exploited to:
- Drain all contract funds
- Achieve 100% win rate through prediction

A complete redesign of the win verification mechanism is required.

