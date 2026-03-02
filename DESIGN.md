# Design (CLI — P0)

This document covers the CLI interface for Scorekeep's first milestone. The CLI parses game definition TOMLs, validates them against schemas, and renders game information to the terminal. No interactive score tracking; this is a read-only tool for testing the data model.

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
