# Fighter Arena – AI Coding Agent Onboarding

This guide is meant to get an autonomous coding agent productive quickly in
this repo. It explains how the two apps relate (authoritative Node server +
Vite/React canvas client), the real-time patterns in play, and where to make
changes safely.

---

## Repository Layout

- `fighter-first/` – Node 18+ Express + Socket.IO authoritative game server.
  Handles user cookies, room orchestration, simulation, and state broadcast.
- `react-fighter/` – Vite/React client with Tailwind/ShadCN UI, Canvas
  renderer, and the prediction/reconciliation game loop.

Both packages have their own `package.json`. Run `npm install` inside each
folder. Common local dev setup:

````bash
cd fighter-first && npm run dev    # starts server on 3000 with CORS to 5173
cd react-fighter && npm run dev    # starts client on 5173 (Vite)

Environment variables read by the client:

- VITE_SOCKET_URL – Socket.IO host (defaults to http://localhost:3001, update
  to http://localhost:3000 if server listens there).
- VITE_API_URL – HTTP API base (http://localhost:3000 typically).

———

## Authoritative Server (fighter-first)

### Entry points

- server.js – sets up Express, registers /api/users routes, exposes /api/
  characters, and creates the Socket.IO server bound to the same HTTP server.
- GameRoom (classes/GameRoom.js) – per-room state, membership tracking, start/
  stop of the simulation, DTO for lobby lists.
- GameLoopService (services/GameLoopService.js) – heartbeat that processes
  player inputs, updates physics, and emits snapshots.

### HTTP layer

- routes/users.js provides /users/set-name (persists username in a cookie)
  and /users/current.
- Character metadata lives in gameConfig/Characters.js and is returned via /
  api/characters.

### Socket event surface

Key events emitted by/consumed on the server:

| Direction | Event | Payload | Notes |
| --- | --- | --- | --- |
| client → server | ping | { clientTimestamp } | Powers latency overlay
(LatencyMonitor).
| server → client | pong | { clientTimestamp, serverTimestamp } | Round-trip
measurement.
| client → server | getRooms | – | Request lobby rooms.
| server → client | roomsList | [{ roomName, ownerId, players, ... }] | Lobby
display.
| client → server | createRoom | { roomName } | Creates GameRoom, auto-joins
caller.
| client → server | joinRoom | { roomName } | Adds socket as player1/2/
spectator.
| client → server | leaveRoom | roomName | Removes socket, may end game.
| client → server | verifyRoom | roomName | Confirms user’s role when
entering /game/:id.
| server → client | roomVerified | "player1" | "player2" | "spectator" |
"unknown" | Driving UI states.
| client → server | characterSelected | { id, name, ... } | Only after
GameRoom membership confirmed.
| server → client | characterSelected | { isPlayer1, character, username } |
Broadcast final selection.
| server → client | initServerPlayers | { players: [state...] } | Sent when
both chars locked in.
| server → client | playerJoined | state | Notifies about late joins.
| server → client | playerLeft | playerId | Cleanup remote entities.
| client → server | playerInputBatch | { keysPressed: Array<keyState>,
currentTick } | Batched predictive inputs.
| server → client | gameState | { players: [{ id, x, height, facing,
velocities, serverTick, lastProcessedInput }] } | Authoritative snapshot (~20
Hz).

### Simulation loop

- GameLoopService.start() runs tick() at ~60 Hz (setInterval(1000/61)).
- Every tick it:
    1. Calls updatePlayerFacingDirections() (nearest opponent heuristic).
    2. For each player in gameState.players:
        - handlePlayerInput() consumes one batched input (see below) and
          updates intent (movingDirection, jumps, attack flags).
        - updatePlayerState() applies physics (movement, jumping, gravity,
          bounds).
    3. Every 3 ticks (tickDiff == 3) it emits gameState to the room (~20 FPS).
    4. Logs perf stats every perfWindow ticks.

### Player state contract

player objects in gameState.players maps include:

{
  id, x, height, facing,
  movingDirection, horizontalVelocity,
  isJumping, verticalVelocity,
  isPunching, isKicking,
  batchInput: Array<{ keysPressed, currentTick }>,
  currentTick, serverTick, lastProcessedInput
}

Important: The server pulls one entry per tick from batchInput. Each entry is
created on receipt of playerInputBatch as:

batchInput.keysPressed.map(keysPressed => ({
  keysPressed,
  currentTick: batchInput.currentTick
}));

So keysPressed is the snapshot object from the client
({ ArrowLeft: bool, ... }). When adding new controls, extend both
InputBatchHandler.keysPressed and server handlePlayerInput().

### Rooms and lifecycle

- GameRoom.gameRooms ({ [roomName]: GameRoom }) is the registry.
  socketIdToRoom maps sockets to rooms for quick lookups on disconnect.
- addSocketToRoom assigns the connection as player1, player2, or a spectator,
  then emits joinGameRoom.
- A game starts (startGame()) once both player1Character and player2Character
  are set; both are set only after characterSelected.
- removeSocketFromRoom stops the loop, notifies remaining participants, and
  deletes the room if a player leaves mid-match.

### Patterns / gotchas

- The authoritative server never trusts client coordinates. Always recompute
  in updatePlayerState.
- Keep timing constants (MOVEMENT_SPEED, JUMP_VELOCITY, etc.) mirrored between
  server’s GameLoopService and client game-engine/contants.js.
- When introducing new combat actions, update the server’s
  handlePlayerInput + updatePlayerState and the client’s prediction code
  (simulatePlayerMovementFrame and renderers) in lockstep.

———

## Client (react-fighter)

### Application shell

- main.jsx wraps <App /> with BrowserRouter.
- App.jsx renders <SocketProvider> (single connection) and routes: / lobby, /
  game/:roomId, fallback.
- components/Layout.jsx + Navbar.jsx provide shared chrome; UI primitives live
  under components/ui/* (ShadCN).

### Socket management

context/SocketContext.jsx:

- Creates one Socket.IO client using VITE_SOCKET_URL.
- Tracks connection status, username, active rooms, and errors; exposes socket
  to hooks (useSocket).
- Automatically requests room list on connect and stores usernames in
  localStorage.
- Handles navigation when joinGameRoom arrives.

### Lobby flow (pages/Lobby.jsx)

- Displays username card, create room form, and active room list.
- API wrapper (src/API.js) posts to /users/set-name (server sets a cookie,
  server later reads cookie in sockets).
- Emits createRoom/joinRoom with the currently stored username and user-
  entered room name.

### Room flow (pages/GameRoom.jsx)

1. On mount, emits verifyRoom with the route param.
2. Listens for roomVerified to know whether the user is player1, player2, or
   a spectator.
3. Subscribes to characterSelected, initServerPlayers, and playerJoined to
   keep player1, player2, and allPlayers (a Map stored in a useRef).
4. Once both players have locked characters, switches roomState to "fighting"
   and renders <FightCanvas>.

### Character selection (components/CharacterSelect.jsx)

- Fetches /api/characters on mount (server-sourced data so everyone sees the
  same list).
- Each side (PlayerSelectionUI) renders a grid on canvas tiles via
  DrawCharPortrait.
- Only the local player can navigate and confirm;
  socket.emit("characterSelected", character) persists the choice server-side.
- Spectators receive both selections via the same characterSelected events.

### Fight experience (components/FightCanvas.jsx)

- Creates LatencyMonitor, Canvas, InputBatchHandler, and GameLoop instances
  once socket + <canvas> ref exist.
- Passes allPlayers (the shared map) and localPlayerId (socket.id) into the
  engine.
- Cleans up by calling gameLoop.stop() on unmount.

### Game engine modules (src/game-engine/*)

- Canvas.js – handles canvas context/resizing, draws initial scene text, keeps
  status DOM node reference.
- contants.js – single source of physics/dimension values (mirror server
  values manually).
- Draw.js – low-level rendering for players, floor, actions, indicator.
- InputBatchHandler.js
    - Registers keydown/keyup, tracks keysPressed.
    - Every time GameLoop hits its 3-frame cadence it calls sendBatch(),
      emitting { keysPressed: [...inputsOnDeck], currentTick }.
    - Also maintains sentInputWithTicks, which is later used for
      reconciliation.
- GameLoop.js
    - Owns client prediction: runs its own animation frame loop (only one
      instance to avoid double rendering).
    - Maintains inputsOnDeck (queue of local inputs pending server ack) and
      uses simulatePlayerMovementFrame() to replay them whenever a server
      snapshot arrives.
    - handleServerUpdateLocalPlayer() applies authoritative state,
      finds matching tick in sentInputWithTicks, removes processed
      inputs, re-simulates the remainder, and calculates a correction
      (localX_Correction) to smoothly interpolate toward the authoritative
      position. See "Client-Side Prediction & Reconciliation Deep Dive" below.
    - Remote players simply follow the latest snapshot (targetX,
      targetHeight). Interpolation hooks are present but currently set to snap
      to the latest target.
    - Sends input batches + advances ticks every 3 frames; mirrors the
      server's 3-tick broadcast cadence.
- LatencyMonitor.js – continuously emits ping, listens to pong, writes a HUD
  overlay to DOM with current/min/max latency and tick count.

### Patterns / gotchas

- allPlayers is shared by reference between React and the game engine; avoid
  replacing the Map object—mutate entries to keep the engine in sync.
- The canvas resizes to the window; when adding UI overlays factor in
  Canvas.resizeCanvas.
- Because InputBatchHandler uses global window listeners, ensure only one
  FightCanvas mounts at a time (current routing guarantees this). When hot-
  reloading, stale listeners can linger; if you implement fast refresh, add
  teardown logic.

———

## Networking & Simulation Contract Checklist

1. Room membership
    - Always verifyRoom on entering /game/:id; reroute to / on roomVerified:
      "unknown".
    - GameRoom.socketIdToRoom is the source of truth; do not try to infer
      membership client-side.
2. Character flow
    - Only emit characterSelected once per player per match. Server tracks
      player1Character / player2Character and starts GameLoopService after
      both are present.
    - Character metadata should stay in sync between fighter-first/gameConfig/
      Characters.js and react-fighter/src/gameConfig/Characters.js. Prefer
      fetching from the server list (current code already does this).
3. Input batching
    - Client collects raw key states per rendered frame → pushes to
      inputsOnDeck.
    - Every 3 frames, client emits playerInputBatch.
    - Server flattens each keysPressed object into player.batchInput so that
      each simulation tick consumes at most one snapshot.
    - When modifying key semantics (new buttons, combos), update:
      InputBatchHandler.keysPressed, GameLoop.updateLocalPlayerGameLoop,
      GameLoop.simulatePlayerMovementFrame, GameLoopService.handlePlayerInput,
      and GameLoopService.updatePlayerState.
4. State broadcast
    - Server emits gameState for the entire room; no per-player messages.
    - Client uses reconciliation for the local player and simple snapping/
      interpolation for others. Keep currentTick updated to prevent
      resimulating stale inputs.
5. Latency measurement
    - LatencyMonitor already exists; leverage it when debugging desyncs. The
      overlay is injected into document.body.

———

## Extending the Game

- Adding a move/combat action
    1. Define the action flag in both server player state and client drawing
       logic.
    2. Capture input on the client (InputBatchHandler, and optionally start/
       stop timers for animation).
    3. Set/clear the new flag in GameLoopService.handlePlayerInput and
       incorporate it into updatePlayerState.
    4. For prediction, mimic the server logic inside
       GameLoop.simulatePlayerMovementFrame.
- Tweaking physics
    - Change constants in both fighter-first/services/GameLoopService.js (top-
      level constants) and react-fighter/src/game-engine/contants.js.
    - Verify that the server tick rate (currently 60 loop Hz, 20 broadcast Hz)
      still divides evenly into the client send cadence (frame % 3).
- Room UX
    - Room DTOs are produced by GameRoom.toDto(). If you add lobby metadata
      (e.g., character names), extend this DTO and update Lobby’s rendering.
- User identity
    - SocketContext listens for userData and persists the username locally.
      If you change auth/storage, update server.js’s checkForUsername and the
      API.js helper.

———

## Client-Side Prediction & Reconciliation Deep Dive

The prediction/reconciliation system keeps movement feeling responsive while
the server remains authoritative. Understanding this flow is critical for
debugging jitter or desync issues.

### Reconciliation Flow (handleServerUpdateLocalPlayer)

When a server gameState arrives:

1. **Capture current state**: Save `futureClientPosition.x` (where client
   predicted the player would be)
2. **Seed from server**: Set player state to the server's authoritative position
3. **Find matching tick**: Locate the server's `currentTick` in
   `sentInputWithTicks`
4. **Replay unprocessed inputs**:
   - `inputsToReplay = sentInputWithTicks.slice(matchingServerTickIndex + 1)`
     (ticks AFTER the one server processed)
   - Also replay `inputsOnDeck` (inputs not yet sent to server)
5. **Calculate correction**: `correction = reconciledX - predictedX`
6. **Apply smoothing**: Gradually move toward the reconciled position

### Critical Implementation Details

**Input replay must skip the processed tick**: When the server responds with
tick N, its state already includes tick N's movement. Use
`slice(matchingServerTickIndex + 1)` to avoid double-counting:

```javascript
// CORRECT - skip the already-processed tick
const inputsToReplay = sentInputWithTicks.slice(matchingServerTickIndex + 1);

// WRONG - replays tick N again, causing double movement
const inputsToReplay = sentInputWithTicks.slice(matchingServerTickIndex);
````

**Smoothing must move TOWARD reconciled, not away**: The correction should
interpolate the visual position toward the authoritative position:

```javascript
// CORRECT - move toward reconciled position
const correction = reconciledX - predictedX;
player.x += correction * 0.3; // Apply 30% per frame

// WRONG - moves away from reconciled back to predicted
const adjustment = predictedX - reconciledX;
player.x += adjustment / 3; // This fights the reconciliation!
```

**High-speed characters amplify errors**: A character with movementSpeed=14.5
moves 43.5 pixels per 3-frame batch. Any frame-counting bug becomes very
visible. Test reconciliation with fast characters.

### Smoothing Implementation

The current smoothing uses exponential decay:

```javascript
// In handleServerUpdateLocalPlayer:
this.localX_Correction = reconciledX - futureClientPosition.x;
this.correctionRemaining = Math.abs(this.localX_Correction);

// In updateLocalPlayerGameLoop (each frame):
if (this.correctionRemaining > 0.5) {
    player.x += this.localX_Correction * 0.3; // Apply 30%
    this.localX_Correction *= 0.7; // Decay remainder
    this.correctionRemaining = Math.abs(this.localX_Correction);
} else {
    player.x += this.localX_Correction; // Snap when close
    this.localX_Correction = 0;
}
```

Tuning the 0.3 factor:

- Higher (0.4-0.5) = faster correction, more responsive, potentially jerkier
- Lower (0.1-0.2) = slower correction, smoother, more drift visible

### Common Jitter Causes

1. **Double-counting inputs**: Replaying the tick the server already processed
2. **Backwards smoothing**: Moving away from authoritative position
3. **Missing inputsOnDeck replay**: Not replaying unsent inputs after seeding
4. **Tick mismatch**: Server and client tick numbers getting out of sync
5. **Asymmetric movement logic**: Client simulatePlayerMovementFrame differs
   from server updatePlayerState (e.g., isJumping checks)

———

## Debugging Tips

- Server logs average loop durations every 60 ticks; if you see spikes,
  instrument GameLoopService for heavy players.
- Use the latency overlay to detect packet loss or spikes; adjust
  LatencyMonitor.historySize or frequency as needed.
- To inspect current rooms, emit getRooms (Lobby does this automatically). You
  can also read GameRoom.gameRooms in a debugger.
- If client prediction drifts, log matchingServerTickIndex in
  GameLoop.handleServerUpdateLocalPlayer; -1 indicates you are missing ticks
  (usually because currentTick got out of sync).
- For reconciliation debugging, the code logs `{ predictedX, reconciledX,
correction }` on each server update. Key patterns:
    - `correction ≈ 0`: System is in sync
    - `correction = ±43.5` (3 × movementSpeed): Likely a frame-counting bug
    - `ticksToReplay = 0` but large correction: Issue with inputsOnDeck replay
    - Oscillating corrections: Smoothing logic may be fighting itself

———

```

```
