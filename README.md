# Scorekeep

A score-tracking tool for card and dice games, built for use on the road.

## CLI Usage

```bash
scorekeep list                  # List all available games
scorekeep info <game-id>        # Show full game reference
scorekeep validate [game-id]    # Validate game definition files
scorekeep score-table <game-id> # Show scoring reference table
```

Options: `--help`, `--no-color`, `--json`

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
