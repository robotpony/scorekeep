# Scorekeep

A score-tracking tool for card and dice games, built for use on the road.

## CLI Usage

```
scorekeep <command> [options]
```

### Commands

**`scorekeep list`** — List all available games.

```
$ scorekeep list

  Games (4)

  dice-5       Dice 5         Roll five dice, score points, reach 10,000 to win.
  golf-4       Golf 4         Four-card golf. Play 9 holes, most hand wins takes it.
  list-simple  Simple Scores  Track scores round by round. Highest total wins.
  yahtzee      Yahtzee        Roll 5 dice, fill 13 categories. Highest total wins.
```

**`scorekeep info <game-id>`** — Show full game reference (rules, scoring, config).

```
$ scorekeep info dice-5

  Dice 5
  Roll five dice, score points, reach 10,000 to win.

  Players: 2–8
  Equipment: 5 6-sided dice

  Rules
  Roll 5 dice. Set aside scoring dice, then re-roll or bank. ...

  ┌──────────┬────────┐
  │ Combo    │ Points │
  ├──────────┼────────┤
  │ Single 1 │    100 │
  │ Single 5 │     50 │
  │ Three 1s │   1000 │
  │ ...      │    ... │
  └──────────┴────────┘
```

**`scorekeep validate [game-id]`** — Validate one or all game definition files.

```
$ scorekeep validate

  Validating games/*.toml

  ✓ dice-5.toml
  ✓ golf-4.toml
  ✓ list-simple.toml
  ✓ yahtzee.toml

  4 games validated, 0 errors
```

**`scorekeep score-table <game-id>`** — Show scoring reference table only.

```
$ scorekeep score-table yahtzee

  Yahtzee — Scoring Reference

  Upper Section
  ┌────────┬─────────────┐
  │ Name   │       Range │
  ├────────┼─────────────┤
  │ Ones   │         0–5 │
  │ Twos   │        0–10 │
  │ ...    │         ... │
  │ Bonus  │ 35 (if ≥63) │
  └────────┴─────────────┘

  Lower Section
  ┌─────────────────┬───────┐
  │ Name            │ Score │
  ├─────────────────┼───────┤
  │ Three of a Kind │  0–30 │
  │ ...             │   ... │
  │ Yahtzee         │    50 │
  │ Chance          │  5–30 │
  └─────────────────┴───────┘
```

### Options

| Flag | Effect |
|------|--------|
| `--help` | Show help message |
| `--no-color` | Disable colour output |
| `--json` | Output as structured JSON |

All commands support `--json` for programmatic use.

## Web App

The web app is a mobile-first React SPA with hash-based routing.

```bash
npm run dev:web                 # Generate definitions + start Vite dev server
npm run build:web               # Generate definitions + production build
npm run preview:web             # Preview production build
```

Routes: Home (`/`), New Game (`/new`), Score Sheet (`/score`), Leaderboard (`/leaderboard`), Game Detail (`/game/:id`).

The home page displays all available games as cards with type badges (Dice, Card, List). Cards link to game detail pages. Responsive layout: bottom tab bar on mobile, top bar on medium screens and above.

### Score Entry

Start a game from the New Game page or a game detail page's "Play this game" button. Enter player names (validated against game's min/max), then score round by round on the Score Sheet.

Each game type has a purpose-built scorecard:

- **List games**: Enter scores per player per round. Running totals update automatically.
- **Cumulative dice** (e.g. Dice 5): Quick-add buttons for common combos, Bank to commit or Farkle for zero. Entry threshold and target detection enforced.
- **Category dice** (e.g. Yahtzee): Click a category, enter a validated score. Upper bonus auto-computes when subtotal ≥ 63. Yahtzee bonus tracked separately.
- **Card/hand-winner** (e.g. Golf 4): Enter scores per hand. Hand winner auto-determined. Ties carry over to the next hand.

Scores auto-save to localStorage. The Score Sheet tab shows a badge when a game is active. Tap the info icon during play for a rules and scoring reference drawer. Single-level undo is available for the last score entry.

## Development

```bash
npm install                     # Install dependencies
npm run dev                     # Run CLI via tsx (dev mode)
npm run dev -- list             # Run a specific command
npm run dev -- info dice-5      # Show game info
npm run build                   # Compile TypeScript to dist/
npm test                        # Run all tests (251 across 22 suites)
npm run test:watch              # Run tests in watch mode
npm run lint                    # Type-check without emitting
```

## Games

Game definitions live in `games/` as TOML files. Four game types are supported:

| Type | Scoring model | Games |
|------|--------------|-------|
| Cumulative dice | Rolling total, target to win | dice-5 |
| Category dice | Fill categories, sum totals | yahtzee |
| Card (hand-winner) | Per-hand winners, final tally | golf-4 |
| List | Per-round scores, sum totals | list-simple |

Adding a new game means adding a TOML file. See `ARCHITECTURE.md` for schema details.

## Phases

- **P0 (complete)**: CLI tool for parsing, validating, and rendering game definitions
- **P1 (complete)**: Web app scaffold (Vite + React + Tailwind, mobile-first, semantic colour palette, error boundary)
- **P2 (complete)**: Score entry for all four game types, session persistence, new game flow, in-game reference
- **P3+**: Player management, game history, leaderboards

See `PLAN.md` for the full roadmap.
