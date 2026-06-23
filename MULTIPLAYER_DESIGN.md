# Design Document: Multiplayer Rooms Implementation

This document proposes a system for implementing multiplayer rooms to play online with friends in the Term.ooo clone. Since the application already has a robust WebSocket chat implementation running on Cloudflare Workers, we can extend this infrastructure to support game rooms.

## 1. System Architecture

Currently, the WebSocket handles real-time chat broadcast to all connected users. We need to introduce the concept of **"Rooms"** or **"Channels"** in both the frontend hooks and the backend worker.

### Room Abstraction
* **Global Chat Room:** The default room everyone joins when loading the site.
* **Game Rooms:** Private or public rooms identified by a unique `roomId` (e.g., a 6-character code `XYZ123`).

### WebSocket Payload Update
All WebSocket messages sent by the client should optionally include a `roomId` field.

```typescript
// Proposed update to `src/game/chat-types.ts`
export interface ChatMessage {
  type: ChatMessageType;
  roomId?: string; // NEW: The room this message belongs to
  // ... existing fields
}
```

## 2. Multiplayer Game Modes

There are two primary ways to play multiplayer:

1. **Cooperative Mode (Co-op):**
   * Players share the same board.
   * When Player A makes a guess, it appears on Player B's screen.
   * The team wins or loses together.

2. **Competitive Mode (Race):**
   * Players have separate boards but share the same solution.
   * Real-time progress is shown (e.g., showing a smaller, obfuscated version of the opponent's board, similar to how Wordle results are shared with emojis).
   * First to guess the word wins.

### Suggested Implementation: Competitive Mode (Easier to implement first)
Competitive mode is simpler because it doesn't require complex conflict resolution (e.g., what happens if two players submit a guess at the exact same millisecond).

## 3. Frontend Implementation Steps

### Step 3.1: Room Management Hooks
Extend `useChatWebSocket` (or create a new `useMultiplayerRooms` hook) to handle room joining and leaving.

```typescript
// New message types to add
type MultiplayerMessageType =
  | 'create-room'
  | 'join-room'
  | 'leave-room'
  | 'room-state-update' // Sent by server to sync room info
  | 'game-guess-submit' // When a player submits a guess
  | 'game-end'
```

### Step 3.2: Updating the Game Engine
Currently, `App.tsx` and `usePersistentGameState` handle game state locally.
When in a multiplayer room:
1. When `processGuess` happens successfully, broadcast a `game-guess-submit` message over the WebSocket.
2. The payload should only contain the evaluated results (colors), not the actual word, to prevent cheating in the WebSocket traffic.

### Step 3.3: User Interface Additions
* **Multiplayer Dashboard:** A new dialog or a section in `TopTabs` where players can create a room or enter a code to join.
* **Room UI:** An overlay showing players currently in the room.
* **Opponent Boards:** A React component rendering miniaturized versions of the opponents' game boards using the same `Tile` components but smaller and non-interactive, updating as WebSocket messages arrive.

### Step 3.4: Sharing the Custom Day
When a room is created, the host selects the game mode (Termo, Dueto, Quarteto) and a random `dayNumber` is generated. This ensures everyone in the room gets the exact same words.

## 4. Backend (Worker) Requirements

Since the backend is presumably a Cloudflare Worker using Durable Objects or WebSockets:
1. **Room State:** The server needs to map `connectionId`s to `roomId`s.
2. **Broadcast Filtering:** When a message is received with a `roomId`, only broadcast it to other connections in that same room.
3. **Room Lifecycle:** Clean up rooms when the last player leaves.

## 5. Security & Anti-Cheat

* Do not send the solution word over the WebSocket.
* When broadcasting guesses, send the state (`correct`, `present`, `absent`) instead of the characters typed, or send the characters but validate them on the receiver side.
* Ensure the random `dayNumber` chosen for the room is hidden from the UI so players can't just open a new tab and look it up.

## 6. Phased Implementation Plan

* **Phase 1:** Add Room UI and allow players to join a room. Chat messages are isolated to the room.
* **Phase 2:** Synchronize game start. When the host clicks "Start", everyone in the room loads the same `dayNumber`.
* **Phase 3:** Broadcast guess states. Display small colored emoji grids next to player names in the room lobby as they make guesses.
* **Phase 4:** Add win/loss condition screens specific to the multiplayer lobby.