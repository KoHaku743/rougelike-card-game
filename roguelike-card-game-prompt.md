# Build a Roguelike Card Browser Game for Gamplo

## Overview

Build a complete, playable roguelike deckbuilder card game as a browser-based single-page application for the **Gamplo** platform. Think "Slay the Spire" meets sci-fi. The player builds a deck by choosing cards after winning combat, explores a node-based map, and fights enemies using tactical card-based combat.

---

## Platform Integration — Gamplo SDK

**Gamplo SDK URL**: `https://gamplo.com/sdk/gamplo.js`

Include the SDK in your `index.html` as a script tag. The SDK auto-initializes when loaded inside the Gamplo iframe and is lightweight (5.6 KB).

### SDK Usage Requirements

```html
<script src="https://gamplo.com/sdk/gamplo.js"></script>
```

Then in your TypeScript/JS, access all SDK features through the `Gamplo` global:

```typescript
// Wait for SDK to be ready (always use onReady — required for auth)
Gamplo.onReady(() => {
  const player = Gamplo.getPlayer();
  if (player) {
    console.log("Player ID:", player.id);
    console.log("Username:", player.username);
    console.log("Display Name:", player.displayName);
    console.log("Avatar URL:", player.image);
  } else {
    console.log("Guest user — cloud saves and achievements disabled");
  }
});

// Handle guest users gracefully
Gamplo.onReady(() => {
  const player = Gamplo.getPlayer();
  if (player === null) {
    // Guest — disable cloud saves, show sign-up prompt
  }
});
```

### What to Integrate

You MUST integrate the following Gamplo features into this game:

#### 1. Player Identity
- Show the player's `displayName` and `image` (avatar) in the game UI header
- Handle guest users (show "Guest" if `Gamplo.getPlayer()` returns `null`)

#### 2. Achievements
Create and unlock the following achievements (use keys as defined below):

| Key | Title | Description | Points |
|-----|-------|-------------|--------|
| `first_kill` | First Blood | Win your first combat | 10 |
| `deck_builder` | Deck Builder | Add 5 cards to your deck in a single run | 10 |
| `victory` | Victory | Defeat the boss and win the game | 25 |
| `death` | Defeated | Lose a run | 5 |
| `overkill` | Overkill | Deal 20+ damage in a single attack | 10 |
| `perfect_run` | Perfect Block | Block 15+ damage in a single combat | 10 |
| `energy_master` | Energy Master | End a turn with 3 energy remaining | 10 |
| `power_surge` | Power Up | Play 3 Power cards in a single combat | 10 |

Unlock achievements via:
```typescript
async function unlockAchievement(key: string) {
  try {
    const result = await Gamplo.unlockAchievement(key);
    if (!result.alreadyUnlocked) {
      showAchievementPopup(result.achievement);
    }
  } catch (e) {
    // Guest users get 403 — ignore silently
  }
}
```

#### 3. Cloud Saves
- Auto-save game state every 30 seconds during gameplay via `Gamplo.setSave(state)`
- Load saved state on game start via `Gamplo.getSave()`
- Save after every combat win, rest node, and card reward selection
- If no save exists, start a fresh run
- Handle guest users gracefully (don't try to save if player is null — just continue without cloud saves)

Save state structure:
```typescript
interface SaveState {
  playerHp: number;
  playerMaxHp: number;
  deck: string[];         // array of card IDs
  currentFloor: number;
  visitedNodes: number[];
  currentNode: number;
  runStats: {
    cardsCollected: number;
    combatsWon: number;
    damageDealt: number;
    damageBlocked: number;
  };
}
```

#### 4. Viewport / Responsive Sizing
```typescript
// Set canvas/game container size to the Gamplo iframe dimensions
const { width, height } = Gamplo.getViewport();
// Use these for your game container / canvas sizing

Gamplo.onResize((width, height) => {
  // Re-render at new size
});
```

---

## Tech Stack

- **Vite + vanilla TypeScript** (no React/Vue/etc.)
- **Single-page app**, no backend needed
- **DOM-based UI** (not canvas) for cards, buttons, and game state
- **Gamplo SDK** for auth, achievements, cloud saves (see SDK section above)
- All code in one `src/` directory, built with `npm run dev`

---

## Core Game Loop

1. Player starts on a map with connected nodes (combat, rest, boss)
2. Player clicks a node to travel → triggers an encounter
3. **Combat encounters**: turn-based card battle
4. **Rest nodes**: restore HP to max
5. **Combat win** → choose 1 of 3 random cards to add to your deck
6. After a path of 3-4 combat encounters → boss fight
7. **Win the boss** → unlock `victory` achievement → victory screen
8. **Player HP hits 0** → unlock `death` achievement → death screen, restart
9. Permadeath: HP and deck carry between encounters within a run

---

## Card System

### Card Structure
Each card has:
- `id` — unique string identifier (e.g., `"plasma_bolt"`)
- `name` — display name
- `type` — "Attack" | "Skill" | "Power"
- `cost` — energy cost (0 to 3), shown in top-left corner
- `description` — what the card does in plain text
- `rarity` — "Common" | "Uncommon" | "Rare"
- `effect` — the actual game effect (damage, block, draw, buff, etc.)

### Card Types
- **Attack** — deals damage to enemy, usually costs energy
- **Skill** — applies block (temporary defense), draws cards, or other utility
- **Power** — persistent buff that lasts the whole combat (or run)

### Turn Flow
- Player has **3 energy** per turn
- At turn start: draw 5 cards from deck into hand
- Playing a card costs energy (shown on card)
- When energy is spent or player ends turn → discard hand → enemy acts → next turn

### Energy System
- Player starts each turn with 3 energy
- Energy refreshes at start of each player turn
- Cards cost 0–3 energy
- Unspent energy does NOT carry over

---

## Deck

### Starting Deck (10 cards)
- 4x "Basic Shot" — Attack, Cost 1, Deal 6 damage
- 3x "Block" — Skill, Cost 1, Gain 5 block
- 3x "Overcharge" — Attack, Cost 0, Deal 3 damage

### Card Pool (progression rewards)
Build a pool of ~25-30 cards across rarities. Examples (sci-fi themed):

**Common (50% chance in reward):**
- "Plasma Bolt" — Attack, Cost 1, Deal 8 damage
- "Shield Boost" — Skill, Cost 1, Gain 6 block
- "Quick Hack" — Attack, Cost 0, Deal 4 damage
- "Backup Drone" — Skill, Cost 1, Gain 4 block, Draw 1 card
- "Energy Surge" — Attack, Cost 2, Deal 12 damage
- "Scrap Shot" — Attack, Cost 1, Deal 5 damage, Draw 1 card

**Uncommon (35% chance):**
- "Railgun Blast" — Attack, Cost 2, Deal 16 damage
- "Plasma Shield" — Skill, Cost 2, Gain 10 block
- "System Override" — Power, Cost 1, Deal 2 damage to enemy at start of each turn
- "Overclock" — Power, Cost 1, Gain 1 energy at the start of each turn
- "Nanobots" — Skill, Cost 1, Restore 8 HP
- "EMP Burst" — Attack, Cost 2, Deal 8 damage, Enemy loses all block

**Rare (15% chance):**
- "Singularity Bomb" — Attack, Cost 3, Deal 24 damage
- "Quantum Shield" — Skill, Cost 2, Gain 15 block, Draw 2 cards
- "Reactor Meltdown" — Power, Cost 2, Deal 5 damage to enemy at start of each turn, take 2 self-damage
- "Hacking Suite" — Power, Cost 1, Enemy starts combat with -5 HP
- "Thruster Boost" — Skill, Cost 0, Gain 8 block, Draw 3 cards

Card rewards after combat: show 3 random cards (weighted by rarity) — player picks 1.

---

## Combat

### Player Stats
- **HP**: starts at 50, max 50 (rest sites restore to max)
- **Block**: starts at 0 each combat, resets each turn
- **Deck**: shuffled draw pile, discard pile

### Combat Flow
1. **Player Turn Start**: regain 3 energy, draw 5 cards
2. Player clicks cards to play them (costs energy)
3. Card effects resolve immediately
4. Player clicks "End Turn" button
5. **Enemy Turn**: enemy acts based on its current intent
6. Enemy damage applied (block absorbs first, then HP)
7. Check win/lose conditions
8. Repeat from step 1

### Enemy Intent System
Every enemy has a visible **intent** showing what they'll do next turn:
- "Attack X" — will deal X damage
- "Defend" — will gain X block
- "Buff" — will power up for next attack
- "Debuff" — will apply a debuff

### Damage Calculation
- Block absorbs damage before HP
- Excess damage does NOT carry over
- Block resets to 0 at start of player turn (not enemy turn)

### Win/Lose Conditions
- **Win combat**: enemy HP ≤ 0 → unlock `first_kill` on first combat win, `deck_builder` when deck has 15+ cards
- **Lose combat**: player HP ≤ 0 → death, game over

### Achievement Triggers During Combat
- `overkill`: Deal 20+ damage in a single card hit
- `perfect_run`: Block 15+ total damage in a single combat
- `energy_master`: End any player turn with exactly 3 energy remaining
- `power_surge`: Play 3+ Power cards in a single combat (track with a counter)

---

## Enemies

### Enemy Structure
- `name`, `hp`, `maxHp`
- `block` (resets each enemy turn)
- `intents` — array of actions that cycle
- `currentIntent` — what's showing to the player
- `damage`, `buffs`, etc.

### Regular Enemies (encounters 1–3)
**1. Patrol Drone**
- HP: 25
- Intents cycle: Attack 6 → Attack 6 → Defend 5
- Fast, predictable, teaches basic blocking

**2. Pirate Raider**
- HP: 35
- Intents cycle: Attack 8 → Attack 5 → Defend 8
- Mix of offense and defense

**3. Mech Sentry**
- HP: 45
- Intents cycle: Attack 10 → Defend 8 → Buff (+3 damage permanently) → Attack 12
- Gets stronger over time, rewards fast kills

**4. Alien Latcher**
- HP: 30
- Intents cycle: Attack 7 → Attack 4 → Debuff (player gains -1 energy next turn)
- Introduces energy disruption

### Boss Enemy (after 3rd encounter)
**The Overseer**
- HP: 100
- Intents cycle: Attack 15 → Defend 12 → Attack 10 → Attack 10 → Buff (+4 damage permanently)
- Big HP pool, hard-hitting, rewarding to fight with a good deck

---

## Map

### Map Layout
A linear path (or simple branching) with 5 nodes total:
```
[Start] → [Combat 1] → [Rest*] → [Combat 2] → [Combat 3] → [Boss] → [Victory]
```
*Rest node may appear randomly between combat nodes

### Node Types
- **Combat** (red/dark node) — fight an enemy
- **Rest** (green node) — restore HP to max
- **Start** — beginning of the map
- **Boss** (large red node) — final boss fight
- **Victory** — shown after defeating the boss

### Map UI
- Show node graph with lines connecting them
- Visited nodes are dimmed or marked
- Current node is highlighted
- Click a connected (unvisited) node to travel there

---

## UI Layout

```
+--------------------------------------------------+
|  [Player Avatar] [Display Name]   [Floor: 1/4]  |
|  [Deck: 10] [Discard: 0]   [HP: 50/50] [Energy] |
+--------------------------------------------------+
|                                                  |
|              [ENEMY AREA]                        |
|   Enemy name, HP bar, block, intent icon+text    |
|                                                  |
+--------------------------------------------------+
|              [CARD HAND AREA]                    |
|   [Card] [Card] [Card] [Card] [Card]            |
|                                                  |
|              [END TURN BUTTON]                  |
+--------------------------------------------------+
```

### Card Rendering
Each card in hand shows:
- Energy cost (top-left, circle)
- Card name (top)
- Card type icon/badge
- Description text
- Rarity color border (Common=gray, Uncommon=blue, Rare=purple)

Cards in hand: hover to raise up slightly, click to play (if enough energy).

### Enemy Rendering
- Enemy sprite/name at top
- HP bar below
- Block amount shown if > 0
- Intent icon with text ("Attack 10", "Defend", etc.)
- When blocking: shield icon visible

### Card Reward Screen
After winning combat, overlay with:
- "Victory!" header
- 3 cards displayed face-up
- "Skip" button to take no card
- Click a card to add it to deck

### Game Over Screen
- "You Died" or "Victory!" message
- Final stats: floors cleared, cards collected
- "Play Again" button

---

## Visual Style

- **Sci-fi / space theme**: dark backgrounds, neon accents (cyan, magenta, electric blue)
- **Card frames**: dark with glowing colored borders based on rarity
- **Enemy area**: dark panel, dramatic lighting
- **Font**: monospace or sci-fi-style font (Orbitron, Share Tech Mono from Google Fonts)
- **Animations** (keep simple):
  - Card hover lift
  - Card play: card flies to target
  - Damage: HP bar shakes, red flash
  - Block: shield shimmer

---

## Achievement Definitions

| Key | Title | Description | Points |
|-----|-------|-------------|--------|
| `first_kill` | First Blood | Win your first combat | 10 |
| `deck_builder` | Deck Builder | Add 5 cards to your deck in a single run | 10 |
| `victory` | Victory | Defeat the boss and win the game | 25 |
| `death` | Defeated | Lose a run | 5 |
| `overkill` | Overkill | Deal 20+ damage in a single attack | 10 |
| `perfect_run` | Perfect Block | Block 15+ damage in a single combat | 10 |
| `energy_master` | Energy Master | End a turn with 3 energy remaining | 10 |
| `power_surge` | Power Up | Play 3 Power cards in a single combat | 10 |

---

## Output

Create the project in `/Users/jankarchnak/roguelike-card-game/`.

Steps:
1. `cd /Users/jankarchnak` and `npm create vite@latest roguelike-card-game -- --template vanilla-ts`
2. `cd roguelike-card-game`
3. Build all the files listed below

File structure:
```
src/
  types.ts       — Card, Enemy, GameState, Player, Intent, Node, SaveState types
  cards.ts       — All card definitions (starter deck + reward pool)
  enemies.ts     — All enemy definitions (4 regular + 1 boss)
  deck.ts        — Deck shuffle, draw, discard logic
  combat.ts      — Combat engine: play card, apply damage, enemy AI turn
  map.ts         — Map generation, node connections, travel
  ui.ts          — All DOM rendering and event handlers
  game.ts        — Game state manager, scene transitions, achievement checks
  achievements.ts — Achievement definitions and unlock helpers
  save.ts        — Gamplo cloud save load/save helpers
  main.ts        — Entry point, init game
index.html       — Includes Gamplo SDK script tag
```

## Quality Checklist

- [ ] Game loads without console errors
- [ ] Gamplo SDK initializes via `Gamplo.onReady()`
- [ ] Player display name and avatar shown in UI
- [ ] Guest users handled (no crash if `Gamplo.getPlayer()` returns `null`)
- [ ] Can play cards (costs energy correctly)
- [ ] Energy resets each turn
- [ ] Block absorbs damage correctly
- [ ] Enemy intent updates after each enemy action
- [ ] Winning combat shows card reward screen
- [ ] Card reward adds selected card to deck
- [ ] Rest node restores HP to max
- [ ] Boss fight works (high HP enemy)
- [ ] Death → unlock `death` achievement → game over screen → restart works
- [ ] Victory → unlock `victory` achievement → win screen after boss
- [ ] Map navigation works (can travel to connected nodes)
- [ ] All 8 achievements defined and unlockable
- [ ] Cloud save on every significant action (combat win, rest, card pick)
- [ ] Cloud load on game start (resume run if save exists)
- [ ] All 10 starter cards + 20+ reward cards implemented
- [ ] All 5 enemies implemented with correct intent cycling
- [ ] No NaN or undefined values in combat (defensive coding)
