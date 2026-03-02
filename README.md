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

### Options

| Flag | Effect |
|------|--------|
| `--help` | Show help message |
| `--no-color` | Disable colour output |
| `--json` | Output as structured JSON |

All commands support `--json` for programmatic use.

## Development

```bash
npm install                     # Install dependencies
npm run dev                     # Run CLI via tsx (dev mode)
npm run dev -- list             # Run a specific command
npm run build                   # Compile TypeScript to dist/
npm test                        # Run tests
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

- **P0 (current)**: CLI tool for parsing, validating, and rendering game definitions
- **P1**: Web app scaffold (Vite + React + TypeScript)
- **P2+**: Score entry, player management, leaderboards

See `PLAN.md` for the full roadmap.
