# Architecture

## Overview

Scorekeep tracks scores for card and dice games. Game rules and scoring logic live in TOML files under `games/`. A build step compiles these into typed TypeScript objects. The CLI (P0) consumes them directly; the web app (future) imports them as modules.

The system supports four game types, each with its own TOML schema and scoring model:

| Type | Schema key | Scoring model | Example |
|------|-----------|---------------|---------|
| Cumulative dice | `dice` + `scoring.method = "cumulative"` | Rolling total, target to win | Dice 5 |
| Category dice | `dice` + `scoring.method = "category-total"` | Fill categories, sum totals | Yahtzee |
| Card (hand-winner) | `card` | Per-hand winners, final tally | Golf 4 |
| List | `list` | Per-round scores, sum totals | Generic tracker |

## Game Definition System

### Why TOML

TOML handles the mix of structured data (scoring tables, player counts) and authored text (rules, turn flow) without JSON's noise or YAML's ambiguity. Game definitions are data files, not configuration, so TOML's flat-table model fits.

### Why per-type schemas

Dice games, card games, and list games have fundamentally different scoring models. A universal schema forces unused fields on every game or relies on untyped catch-all bags. Per-type schemas keep each TOML file clean and produce strong TypeScript types.

Trade-off: more schemas to maintain. Mitigation: the schemas share a common base (game metadata, players, rules) and diverge only in type-specific sections.

## TOML Schemas

### Common Base (all game types)

Every TOML file contains these sections:

**`[game]`** — Identity and metadata.
- `id` (string): Unique slug, used as a key throughout the app.
- `name` (string): Display name.
- `type` (string): One of `"dice"`, `"card"`, `"list"`. Determines which schema applies.
- `description` (string): One-sentence summary for game selection UI.

**`[players]`** — Player count constraints.
- `min` (integer): Minimum players.
- `max` (integer): Maximum players.

**`[scorecard]`** — UI rendering hints.
- `layout` (string): Which scoreboard component to render.
- `entry` (string): How scores are entered.
- Additional fields vary by game type.

**`[rules]`** — Game rules for display. Optional for list games.
- `turn_order` (string): How to determine first player.
- `summary` (string): One-paragraph overview.
- `turn_flow` (string[]): Ordered steps in a turn. Rendered as numbered list.
- `key_rules` (string[]): Critical rules. Rendered as bullet list.

### Cumulative Dice Games

Schema key: `type = "dice"`, `scoring.method = "cumulative"`
Reference: `games/dice-5.toml`

**`[equipment]`**
- `dice_count` (integer): Number of dice.
- `dice_sides` (integer): Sides per die.

**`[scoring]`**
- `method`: `"cumulative"`.
- `target` (integer): Score to win.
- `entry_threshold` (integer): Minimum first score to get on the board.
- `increment` (integer): Valid scores must be multiples of this.
- `endgame` (string): `"immediate"` (first to target wins) or `"final-round"` (others get one more turn).

**`[scoring.singles]`**
- Keys are face values (integers), values are points. Only listed faces score individually.

**`[scoring.of_a_kind]`**
- `min` (integer): Minimum matching dice to trigger.
- `multiplier` (integer): Base formula is `face × multiplier`.
- `extra_die_bonus` (integer): Points per die beyond `min`.

**`[scoring.of_a_kind.overrides]`**
- Keys are face values, values replace the formula result for `min`-of-a-kind. `extra_die_bonus` still stacks on top.

**`[scorecard]`**
- `layout`: `"running-total"` (rounds as rows, players as columns, cumulative totals).
- `entry`: `"accumulator"` (buttons derived from scoring rules, with commit/zero actions and direct-entry fallback) or `"direct"`.
- `commit_label` (string, optional): Label for the "end turn and save" action.
- `zero_label` (string, optional): Label for the "end turn with zero" action.

### Category Dice Games

Schema key: `type = "dice"`, `scoring.method = "category-total"`
Reference: `games/yahtzee.toml`

**`[equipment]`** — Same as cumulative dice.

**`[scoring]`**
- `method`: `"category-total"`.
- `rounds` (integer): Number of turns (one per category).
- `rolls_per_turn` (integer): Max rolls per turn. Reference data for cheat sheet.
- `winner` (string): `"highest"` or `"lowest"` total wins.

**`[scoring.upper]`**
- `faces` (integer[]): Face values with generated categories (e.g., `[1,2,3,4,5,6]` → "Ones" through "Sixes").
- `bonus_threshold` (integer): Upper subtotal needed for bonus.
- `bonus_value` (integer): Bonus awarded if threshold met.

Upper category validation: 0 to `face × dice_count`, in increments of `face`.

**`[[scoring.lower]]`** — Array of individually defined categories.
- `name` (string): Category display name.
- `rule` (string): One-line scoring description.
- `score` (integer, optional): Fixed value. Valid entries: 0 or this value.
- `range` ([integer, integer], optional): Valid range. Each category has `score` or `range`, not both.

**`[scoring.yahtzee_bonus]`**
- `value` (integer): Points per additional Yahtzee.

**`[scorecard]`**
- `layout`: `"category-grid"` (upper/lower sections as row groups, players as columns).
- `entry`: `"category-select"` (pick unused category, enter validated score).

### Card Games (Hand-Winner)

Schema key: `type = "card"`
Reference: `games/golf-4.toml`

**`[equipment]`**
- `deck` (string): Deck type (e.g., `"standard-52"`).
- `cards_per_player` (integer): Cards dealt per player per hand.

**`[scoring]`**
- `rounds` (integer): Fixed number of hands.

**`[scoring.hand]`**
- `winner` (string): `"lowest"` or `"highest"` hand score wins.
- `tie` (string): `"carryover"` (skins-style), `"split"` (shared credit), or `"none"` (voided).

**`[scoring.card_values]`**
- Keys are card names (`ace`, `jack`, `queen`, `king`), values are point values. Number cards (2–10) are face value by default for standard decks.

**`[scoring.modifiers]`**
- Special scoring rules. Example: `pair = 0` means matching rank pairs score 0 for both cards.

**`[scoring.final]`**
- `metric` (string): What the final score counts. `"hand-wins"` = number of hands won.
- `lowest_cumulative_bonus` (integer): Bonus for player with lowest cumulative hand scores.
- `winner` (string): `"highest"` or `"lowest"` final score wins.

**`[scorecard]`**
- `layout`: `"golf-card"` (holes as columns, players as rows, winners marked).
- `entry`: `"direct"`.
- `mark_winner` (boolean): Auto-determine and mark hand winners on scorecard.

### List Games

Schema key: `type = "list"`
Reference: `games/list-simple.toml`

List games are the simplest type: enter a number per player per round, sum totals, declare a winner. No special rules, bonuses, or thresholds.

**`[scoring]`**
- `winner` (string): `"highest"` or `"lowest"` total wins.

**`[scorecard]`**
- `layout`: `"list-vertical"` (rounds as rows, players as columns) or `"list-horizontal"` (players as rows, rounds as columns).
- `entry`: `"direct"`.

**`[rules]`** — Optional for list games. When omitted, the app renders a minimal default ("Enter scores each round").

## TypeScript Types

TOML files compile to typed objects. Each game type has its own interface extending a common base. The top-level union is discriminated on `game.type` and (for dice games) `scoring.method`.

```typescript
// Common base
interface GameDefinitionBase {
  game: {
    id: string;
    name: string;
    type: string;
    description: string;
  };
  players: {
    min: number;
    max: number;
  };
  scorecard: {
    layout: string;
    entry: string;
  };
  rules?: {
    turn_order: string;
    summary: string;
    turn_flow: string[];
    key_rules: string[];
  };
}

// Dice game base (shared by cumulative and category)
interface DiceGameBase extends GameDefinitionBase {
  game: GameDefinitionBase['game'] & { type: 'dice' };
  equipment: {
    dice_count: number;
    dice_sides: number;
  };
  rules: NonNullable<GameDefinitionBase['rules']>;
}

// Cumulative dice (dice-5)
interface DiceCumulativeGame extends DiceGameBase {
  scoring: {
    method: 'cumulative';
    target: number;
    entry_threshold: number;
    increment: number;
    endgame: 'immediate' | 'final-round';
    singles: Record<number, number>;
    of_a_kind: {
      min: number;
      multiplier: number;
      extra_die_bonus: number;
      overrides: Record<number, number>;
    };
  };
  scorecard: GameDefinitionBase['scorecard'] & {
    layout: 'running-total';
    entry: 'accumulator' | 'direct';
    commit_label?: string;
    zero_label?: string;
  };
}

// Category dice (Yahtzee)
interface DiceCategoryGame extends DiceGameBase {
  scoring: {
    method: 'category-total';
    rounds: number;
    rolls_per_turn: number;
    winner: 'highest' | 'lowest';
    upper: {
      faces: number[];
      bonus_threshold: number;
      bonus_value: number;
    };
    lower: Array<{
      name: string;
      rule: string;
      score?: number;
      range?: [number, number];
    }>;
    yahtzee_bonus: {
      value: number;
    };
  };
  scorecard: GameDefinitionBase['scorecard'] & {
    layout: 'category-grid';
    entry: 'category-select';
  };
}

// Card games (golf-4)
interface CardGameDefinition extends GameDefinitionBase {
  game: GameDefinitionBase['game'] & { type: 'card' };
  equipment: {
    deck: string;
    cards_per_player: number;
  };
  scoring: {
    rounds: number;
    hand: {
      winner: 'lowest' | 'highest';
      tie: 'carryover' | 'split' | 'none';
    };
    card_values: Record<string, number>;
    modifiers: Record<string, number>;
    final: {
      metric: 'hand-wins';
      lowest_cumulative_bonus: number;
      winner: 'highest' | 'lowest';
    };
  };
  scorecard: GameDefinitionBase['scorecard'] & {
    layout: 'golf-card';
    entry: 'direct';
    mark_winner: boolean;
  };
  rules: NonNullable<GameDefinitionBase['rules']>;
}

// List games
interface ListGameDefinition extends GameDefinitionBase {
  game: GameDefinitionBase['game'] & { type: 'list' };
  scoring: {
    winner: 'highest' | 'lowest';
  };
  scorecard: GameDefinitionBase['scorecard'] & {
    layout: 'list-vertical' | 'list-horizontal';
    entry: 'direct';
  };
}

// Top-level union
type DiceGameDefinition = DiceCumulativeGame | DiceCategoryGame;
type GameDefinition =
  | DiceCumulativeGame
  | DiceCategoryGame
  | CardGameDefinition
  | ListGameDefinition;
```

### Type narrowing

Use `game.type` for the first level of discrimination, then `scoring.method` for dice subtypes:

```typescript
function isDiceGame(def: GameDefinition): def is DiceGameDefinition {
  return def.game.type === 'dice';
}

function isCumulative(def: DiceGameDefinition): def is DiceCumulativeGame {
  return def.scoring.method === 'cumulative';
}
```

## Build Pipeline

```
games/*.toml
    ↓  parse (smol-toml)
    ↓  validate (zod schemas)
src/definitions/index.ts  (typed game registry)
    ↓  imported by
CLI commands / future web app
```

### Steps

1. Read each `.toml` file from `games/`.
2. Parse TOML into a plain object.
3. Determine the game type from `game.type`.
4. Validate against the corresponding Zod schema. Fail the build on errors.
5. Export a typed registry: `Record<string, GameDefinition>`.

For P0 (CLI), the build step is a Node script invoked before the CLI runs or as part of the CLI startup. For P1+ (Vite app), it becomes a Vite plugin that runs at build time.

### Registry format

```typescript
// src/definitions/index.ts (generated)
import type { GameDefinition } from '../types/game';

export const games: Record<string, GameDefinition> = {
  'dice-5': { /* ... */ },
  'yahtzee': { /* ... */ },
  'golf-4': { /* ... */ },
  'list-simple': { /* ... */ },
};
```

The CLI can also load and validate TOML files directly at runtime (no code generation needed for P0). The generated registry matters more for the web app where we want build-time compilation.

## Validation Logic

Score validation is driven by the game definition. Each game type has its own validation path.

### Cumulative dice (dice-5)

```
Score entered
  → Is score % increment === 0?            No → reject
  → Is first score and score > 0
    and score < entry_threshold?            Yes → reject
  → Accept and persist
  → Is cumulative total >= target?
      endgame = "immediate" → game over
      endgame = "final-round" → remaining players get one turn
```

### Category dice (Yahtzee)

```
Player selects unused category, enters score
  → Fixed-value category (has `score`)?     Score must be 0 or the fixed value
  → Range category (has `range`)?           Score must be within [min, max]
  → Upper face category?                    Score must be 0 to face × dice_count,
                                            in increments of face
  → Accept and persist
  → All categories filled?
      Compute upper bonus (subtotal >= threshold → add bonus)
      Sum upper + bonus + lower + yahtzee bonuses
      Compare totals, winner per `scoring.winner`
```

### Card games (golf-4)

```
All players enter hand scores for current round
  → Determine winner per scoring.hand.winner (lowest/highest)
  → Single winner? → Record win (value = 1 + pending carryover), reset carryover
  → Tie?
      carryover → record null, increment pending carryover
      split → credit all tied players
      none → no winner recorded
  → Last round?
      Compute final: hand_wins + lowest_cumulative_bonus (if applicable)
      Winner per scoring.final.winner
```

### List games

```
Player enters score for current round
  → Accept any number (no validation beyond type check)
  → Sum all rounds per player
  → Winner per scoring.winner (highest/lowest total)
```

## Data Model (Game Sessions)

Game sessions track active and completed games. The session structure varies by game type, mirroring the definition types.

```typescript
interface GameSessionBase {
  id: string;
  game_id: string;              // references GameDefinition.game.id
  players: string[];            // ordered by turn
  status: 'active' | 'finished';
  winner?: string;
  created_at: string;           // ISO 8601
  updated_at: string;
}

interface CumulativeGameSession extends GameSessionBase {
  type: 'cumulative';
  scores: number[][];           // scores[playerIndex][roundIndex]
}

interface CategoryGameSession extends GameSessionBase {
  type: 'category';
  category_scores: Record<string, number>[]; // per player
  yahtzee_bonuses: number[];                 // bonus count per player
}

interface HandWinnerGameSession extends GameSessionBase {
  type: 'hand-winner';
  hand_scores: number[][];              // hand_scores[playerIndex][roundIndex]
  hand_winners: (string | null)[];      // winner per round, null = carryover
  hand_win_values: number[];            // value of each round's win (>1 from carryover)
}

interface ListGameSession extends GameSessionBase {
  type: 'list';
  scores: number[][];           // scores[playerIndex][roundIndex]
}

type GameSession =
  | CumulativeGameSession
  | CategoryGameSession
  | HandWinnerGameSession
  | ListGameSession;
```

Sessions auto-save after every change. For P0 (CLI), persistence is not needed (output only). For P1+, localStorage or IndexedDB.

## Scoring Table Generation

For cumulative dice games, the app computes a full scoring reference table from `scoring.singles` and `scoring.of_a_kind`. This table is displayed in the info popover and drives the accumulator buttons.

### Algorithm

For each face value 1–`dice_sides`:
1. Check if `singles[face]` exists → single die score.
2. For n = `of_a_kind.min` to `dice_count`:
   - Base = `overrides[face]` if it exists, else `face × multiplier`.
   - Bonus = `(n - min) × extra_die_bonus`.
   - Total = base + bonus.

Example output for dice-5:

| Combo | Points |
|-------|--------|
| Single 1 | 100 |
| Single 5 | 50 |
| Three 1s | 1,000 |
| Three 2s | 200 |
| Three 3s | 300 |
| ... | ... |
| Four 1s | 1,050 |
| Five 1s | 1,100 |

## Decisions

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| TOML over JSON/YAML | Better for mixed data+text, less noise than JSON, less ambiguous than YAML | Less common; needs a parsing library |
| Per-type schemas over universal | Strong types per game type, clean TOML files | More schemas to maintain |
| Build-time compilation | No runtime parsing, tree-shakeable, type-safe imports | Extra build step, can't add games at runtime |
| Discriminated unions over class hierarchy | Simpler, works well with TypeScript pattern matching, serializable | Verbose type narrowing |
| Zod for validation | Runtime validation + TypeScript inference from same schema | Adds a dependency |
| CLI-first (P0) | Validate the data model and schemas before building UI | Delays the app users actually want |
| `rules` optional for list games | List games may have no meaningful rules to display | Inconsistency in the base type |
