# Combat System Implementation Plan

## Overview
Add punch/kick collision detection with server-authoritative hit detection.

## Design Decisions
- **Hit feedback**: Wait for server confirmation (no client-side hit prediction)
- **Hit reaction**: Knockback + hit stun when hit
- **Round system**: Reset health and track wins (best of 3)

## Architecture Summary

**Server Authority**: Server determines all hits, damage, and health values
**Client**: Shows attack animations immediately; waits for server to confirm hits
**Reconciliation**: Health/combat state synced via existing gameState broadcast + dedicated hit events

---

## Data Structures

### Server Player State (add to existing)
```javascript
{
  health: 100,
  maxHealth: 100,
  attackState: {
    type: 'punch' | 'kick' | null,
    startTick: number,
    hasHit: boolean  // Prevents multi-hit per attack
  },
  hitStun: number,        // Frames remaining
  knockbackVelocity: number
}
```

### Combat Hit Event (server -> client)
```javascript
{
  attackerId, targetId, attackType,
  damage, targetNewHealth, knockback, tick
}
```

---

## Implementation Steps

### Phase 1: Server Health & Attack State

**File: `fighter-first/server.js`** (lines ~125-145)
- Add health fields to player initialization in `characterSelected` handler

**File: `fighter-first/services/GameLoopService.js`**
- Add combat constants at top (damage values, active frames, knockback)
- Modify `handlePlayerInput()` to track attack state with startTick and hasHit flag
- Modify `updatePlayerState()` to handle attack duration expiry
- Include health/attackState in gameState broadcast

### Phase 2: Server Collision Detection

**File: `fighter-first/services/GameLoopService.js`**
- Add `processCombat()` method called in `tick()` after player updates
- Add `isAttackActive()` - check if attack is in active frames
- Add `getAttackHitbox()` / `getPlayerHurtbox()` - calculate collision boxes
- Add `boxesOverlap()` - AABB collision check
- Add `applyHit()` - apply damage, set hasHit=true, apply knockback
- Add `emitHitEvents()` - emit 'combatHits' socket event

### Phase 3: Client Health Display

**File: `react-fighter/src/game-engine/GameLoop.js`**
- Add 'combatHits' socket listener in `init()`
- Add `handleCombatHits()` - update player health, store for visual effects
- Update `handleServerUpdateLocalPlayer()` to include health reconciliation
- Add `drawHealthBar()` rendering in game loop
- Add hit effect rendering (damage numbers, flash)

### Phase 4: Round System

**File: `fighter-first/services/GameLoopService.js`**
- Add `checkRoundEnd()` - detect when a player's health reaches 0
- Add `resetRound()` - restore both players to full health, reset positions
- Track `player1Wins` and `player2Wins` in GameRoom

**File: `fighter-first/classes/GameRoom.js`**
- Add win tracking state: `player1Wins`, `player2Wins`, `roundsToWin` (default 2)
- Emit `roundEnd` event with winner info
- Emit `matchEnd` when a player reaches required wins

**File: `react-fighter/src/game-engine/GameLoop.js`**
- Add listeners for `roundEnd` and `matchEnd` events
- Show round winner announcement
- Display win count in UI

### Phase 5: Polish
- Hit stun prevents movement during stun frames
- Knockback pushes player back on hit
- Smooth health bar animation
- Visual effects for round transitions

---

## Key Constants

```javascript
// Damage
PUNCH_DAMAGE: 10
KICK_DAMAGE: 15

// Active frames (when hitbox can connect)
PUNCH_ACTIVE_START: 3   // frames after attack starts
PUNCH_ACTIVE_END: 8
KICK_ACTIVE_START: 5
KICK_ACTIVE_END: 12

// Hit reaction
HIT_STUN_FRAMES: 10
KNOCKBACK_PUNCH: 3
KNOCKBACK_KICK: 5
```

---

## Socket Events

| Event | Direction | Purpose |
|-------|-----------|---------|
| `combatHits` | Server -> All | Broadcast confirmed hits with damage |
| `roundEnd` | Server -> All | Announce round winner, current win counts |
| `matchEnd` | Server -> All | Announce match winner (best of 3) |

---

## Files to Modify

1. `fighter-first/services/GameLoopService.js` - Core combat logic, round detection
2. `fighter-first/server.js` - Player initialization with health
3. `fighter-first/classes/GameRoom.js` - Win tracking state
4. `react-fighter/src/game-engine/GameLoop.js` - Client rendering & events
5. `react-fighter/src/game-engine/Draw.js` - Health bar drawing
6. `react-fighter/src/game-engine/contants.js` - Combat constants

---

## Verification

1. Start server and two player clients
2. Both players select characters and game starts
3. One player punches - animation shows immediately
4. If punch connects, server broadcasts `combatHits`
5. Both clients show damage number and health bar update
6. Hit player experiences brief stun and knockback
7. Spectator sees all combat in real-time
8. When health reaches 0:
   - Server emits `roundEnd` with winner
   - Both players reset to full health and starting positions
   - Win count updates (displayed in UI)
9. When a player wins 2 rounds:
   - Server emits `matchEnd`
   - Victory screen shown
   - Players can rematch or return to lobby
