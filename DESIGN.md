# Design (CLI — P0)

This document covers the CLI interface for Scorekeep's first milestone. The CLI parses game definition TOMLs, validates them against schemas, and renders game information to the terminal. No interactive score tracking; this is a read-only tool for testing the data model.

## Requirements

- Can easily find and select a game from a list
- Can view game rules and scoring reference before starting
- Can easily keep score, especially on a phone or tablet
- Can save games; current scores are always persisted
- Remembers player names so you can repeat games with the same people
- Games are defined in TOML files with structured schemas and human-readable rules
- Supports 4 game types: cumulative dice (dice-5), category dice (yahtzee), card/hand-winner (golf-4), and list (list-simple)
- Scoring interface should look like a scorecard for the game it's for (e.g., golf-style scoring, Yahtzee grid, running total for dice). The look/feel should be clear, easy to use, and feel like the game it's from
- Works offline and on the road (PWA)


## Commands

### `scorekeep list`

Lists all available game definitions.

```
$ scorekeep list

  Games (4)

  dice-5       Dice 5        Roll five dice, score points, reach 10,000 to win.
  yahtzee      Yahtzee       Roll 5 dice, fill 13 categories. Highest total wins.
  golf-4       Golf 4        Four-card golf. Play 9 holes, most hand wins takes it.
  list-simple  Simple Scores Track scores round by round. Highest total wins.
```

Output columns: id, name, description. Sorted alphabetically by id.

### `scorekeep info <game-id>`

Prints the full game reference for a specific game: rules, scoring reference, and scorecard configuration.

```
$ scorekeep info dice-5

  Dice 5
  Roll five dice, score points, reach 10,000 to win.

  Players: 2–8
  Equipment: 5 six-sided dice

  Rules
  Roll 5 dice. Set aside scoring dice, then re-roll or bank.
  No scoring dice = lose unbanked points.
  All 5 scoring = hot dice, roll again.

  Turn flow
  1. Roll all 5 dice
  2. Set aside at least one scoring die
  3. Re-roll remaining dice or bank points
  4. No scoring dice = lose all unbanked points
  5. All 5 scoring = pick up all 5, keep rolling

  Key rules
  • Must score 1,000+ in one turn to get on the board
  • Must set aside at least one scoring die each roll
  • All 5 dice scoring = hot dice, roll all 5 again
  • First player to 10,000 wins

  Scoring reference
  ┌─────────────┬────────┐
  │ Combo       │ Points │
  ├─────────────┼────────┤
  │ Single 1    │    100 │
  │ Single 5    │     50 │
  │ Three 1s    │  1,000 │
  │ Three 2s    │    200 │
  │ Three 3s    │    300 │
  │ Three 4s    │    400 │
  │ Three 5s    │    500 │
  │ Three 6s    │    600 │
  │ Four 1s     │  1,050 │
  │ Four 2s     │    250 │
  │ ...         │    ... │
  └─────────────┴────────┘

  Turn order: Each player rolls one die. Lowest goes first.

  Scorecard
  Layout: running-total
  Entry: accumulator (Bank / Farkle)
  Target: 10,000 | Threshold: 1,000 | Increment: 50
```

The scoring reference section adapts to game type:
- **Cumulative dice**: Computed scoring table from singles + of-a-kind rules.
- **Category dice**: Upper section faces, lower section categories with rules and score/range.
- **Card games**: Card values table and modifiers.
- **List games**: No scoring reference (just "Sum of all rounds").

### `scorekeep validate [game-id]`

Validates TOML files against their schemas. Without an argument, validates all files in `games/`. With an argument, validates a single game.

```
$ scorekeep validate

  Validating games/*.toml

  ✓ dice-5.toml
  ✓ yahtzee.toml
  ✓ golf-4.toml
  ✓ list-simple.toml

  4 games validated, 0 errors
```

On failure:

```
$ scorekeep validate broken-game

  Validating games/broken-game.toml

  ✗ broken-game.toml
    scoring.target: Required (missing field)
    scoring.increment: Expected number, received string
    players.min: Number must be greater than 0

  1 game validated, 3 errors
```

Validation errors reference the TOML path and use Zod's error messages. Exit code 0 on success, 1 on failure.

### `scorekeep score-table <game-id>`

Prints just the scoring reference table for a game. Useful as a quick cheat sheet.

```
$ scorekeep score-table yahtzee

  Yahtzee — Scoring Reference

  Upper Section
  ┌────────┬──────────────────────┬───────────┐
  │ Name   │ Rule                 │ Max Score │
  ├────────┼──────────────────────┼───────────┤
  │ Ones   │ Sum of all 1s        │         5 │
  │ Twos   │ Sum of all 2s        │        10 │
  │ Threes │ Sum of all 3s        │        15 │
  │ Fours  │ Sum of all 4s        │        20 │
  │ Fives  │ Sum of all 5s        │        25 │
  │ Sixes  │ Sum of all 6s        │        30 │
  ├────────┼──────────────────────┼───────────┤
  │ Bonus  │ 63+ in upper section │        35 │
  └────────┴──────────────────────┴───────────┘

  Lower Section
  ┌──────────────────┬──────────────────────────┬───────┐
  │ Name             │ Rule                     │ Score │
  ├──────────────────┼──────────────────────────┼───────┤
  │ Three of a Kind  │ 3+ matching: sum all dice│  0–30 │
  │ Four of a Kind   │ 4+ matching: sum all dice│  0–30 │
  │ Full House       │ 3 of one + 2 of another  │    25 │
  │ Small Straight   │ 4 sequential dice        │    30 │
  │ Large Straight   │ 5 sequential dice        │    40 │
  │ Yahtzee          │ 5 of a kind              │    50 │
  │ Chance           │ Sum of all dice           │  5–30 │
  └──────────────────┴──────────────────────────┴───────┘

  Yahtzee Bonus: +100 per additional Yahtzee
```

For list games, this command prints a short note ("No scoring reference — scores are summed directly") and exits.

## Output Format

### Colour

The CLI uses colour sparingly for scannability:
- **Game names and section headers**: Bold.
- **Success markers** (✓): Green.
- **Error markers** (✗): Red.
- **Error details**: Dim/grey for paths, normal for messages.
- **Table borders**: Dim/grey.

Colour is disabled when stdout is not a TTY (piped output), or via a `--no-color` flag.

### Tables

Box-drawing characters for structured data. Tables right-align numeric columns and left-align text. Column widths adapt to content.

### Spacing

Two-space indent for all content under a section header. One blank line between sections. No trailing whitespace.

## Error Handling

### File errors

```
$ scorekeep info nonexistent

  Error: No game definition found for "nonexistent"
  Available games: dice-5, yahtzee, golf-4, list-simple
```

### Parse errors

```
$ scorekeep validate bad-toml

  ✗ bad-toml.toml
    TOML parse error at line 12: Unexpected character

  1 game validated, 1 error
```

### Schema errors

Zod validation errors are mapped to TOML-style dotted paths. Multiple errors per file are listed together. The CLI does not stop at the first error within a file.

## Flags

| Flag | Effect |
|------|--------|
| `--no-color` | Disable colour output |
| `--json` | Output as JSON (for `list`, `info`, `validate`) |
| `--help` | Show usage |

`--json` outputs the parsed and validated game definition as JSON. Useful for debugging and for future tooling that consumes game definitions.

## Non-goals (P0)

- Interactive score tracking (no game sessions)
- Persistence (no localStorage/IndexedDB)
- Player management
- Web UI

---

# Design (Web — P1)

The web app is a mobile-first React SPA that renders game definitions compiled from TOML at build time. P1 establishes the navigation shell and game list. Score entry, persistence, and player management come in later phases.

## Layout

### Mobile (< 768px)

```
┌─────────────────────┐
│  Scorekeep      [≡] │  ← top bar (app name, optional menu)
├─────────────────────┤
│                     │
│     Page content    │  ← scrollable content area
│                     │
│                     │
├─────────────────────┤
│ 🏠  ➕  📋  🏆  │  ← bottom tab bar (fixed)
│ Home New  Score Lead│
└─────────────────────┘
```

Bottom tab bar is fixed. Content area scrolls independently. Active tab is highlighted with accent colour.

### Tablet / Desktop (≥ 768px)

```
┌─────────────────────────────────────┐
│  Scorekeep    Home  New  Score  Lead│  ← top navigation bar
├─────────────────────────────────────┤
│                                     │
│           Page content              │  ← wider content area
│                                     │
└─────────────────────────────────────┘
```

Tabs move to the top bar on wider screens. No bottom bar. Content area is wider with max-width constraint for readability.

## Pages

### Home (`/`)

The landing page. Shows all available games as cards.

```
┌─────────────────────┐
│  Games              │
│                     │
│  ┌─────────────────┐│
│  │ 🎲 Dice 5      ││
│  │ Roll five dice, ││
│  │ score points... ││
│  └─────────────────┘│
│  ┌─────────────────┐│
│  │ 🎲 Yahtzee     ││
│  │ Roll 5 dice,   ││
│  │ fill 13 cats...││
│  └─────────────────┘│
│  ┌─────────────────┐│
│  │ 🃏 Golf 4      ││
│  │ Four-card golf. ││
│  │ Play 9 holes...││
│  └─────────────────┘│
│  ┌─────────────────┐│
│  │ 📝 Simple      ││
│  │ Track scores    ││
│  │ round by round. ││
│  └─────────────────┘│
└─────────────────────┘
```

Each card shows:
- **Type badge**: Dice, Card, or List with a colour.
- **Game name**: Bold.
- **Description**: One line, truncated if needed.

Cards link to `/new?game=<id>` (non-functional in P1). Responsive grid: 1 column on mobile, 2 on tablet, 3 on desktop.

### New Game (`/new`)

Shows game selection with "Play" buttons. Non-functional in P1.

```
┌─────────────────────┐
│  Start a new game   │
│                     │
│  ┌────────────┬────┐│
│  │ Dice 5     │Play││
│  ├────────────┼────┤│
│  │ Yahtzee    │Play││
│  ├────────────┼────┤│
│  │ Golf 4     │Play││
│  ├────────────┼────┤│
│  │ Simple     │Play││
│  └────────────┴────┘│
│                     │
│  Player setup       │
│  coming in a future │
│  update.            │
└─────────────────────┘
```

### Score Sheet (`/score`)

Empty state in P1. Will show active game scorecard in P2.

```
┌─────────────────────┐
│                     │
│                     │
│       [icon]        │
│                     │
│  No active game     │
│                     │
│  Start a new game → │
│                     │
│                     │
└─────────────────────┘
```

### Leaderboard (`/leaderboard`)

Empty state in P1. Will show stats in P4.

```
┌─────────────────────┐
│                     │
│                     │
│       [icon]        │
│                     │
│  No games played    │
│  yet                │
│                     │
│  Play your first    │
│  game →             │
│                     │
└─────────────────────┘
```

## Visual Design

### Colour

Minimal palette. Defined in Tailwind config.

- **Background**: White (light), slate-900 (dark).
- **Text**: Slate-900 (light), slate-100 (dark).
- **Accent**: A single accent colour for active tabs, buttons, and links.
- **Type badges**: Distinct muted colours per game type (e.g., blue for dice, green for card, amber for list).

### Dark mode

Supported via `prefers-color-scheme`. Tailwind `dark:` classes. No manual toggle in P1.

### Typography

System font stack. No custom fonts. Sizes follow Tailwind defaults.

## TOML → Web Pipeline

```
games/*.toml
    ↓  scripts/generate-definitions.ts
    ↓  parse (smol-toml) + validate (zod schemas)
src/definitions/games.ts  (generated, gitignored)
    ↓  imported by
src/app/  (React components)
```

The generated module exports:

```typescript
import type { GameDefinition } from '../types/game.js';

export const games: Record<string, GameDefinition> = { ... };
export const gameList: GameDefinition[] = [ ... ]; // sorted by name
export const gameIds: string[] = [ ... ];
```

The generate script reuses the existing loader (`src/loader/`) and schemas (`src/schemas/`). It runs before dev and build via npm scripts.

## Non-goals (P1)

- Score entry or game sessions (P2)
- Player management (P3)
- Leaderboard data (P4)
- PWA / offline support (P5+)
- Server-side rendering
