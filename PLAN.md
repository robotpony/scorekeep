# Plan

Phased implementation plan for Scorekeep. P0 (CLI) is scoped in detail. Future phases are outlined for context but will be planned when we get there.

## ~~P0 — CLI Tool~~ (complete)

Goal: Parse, validate, and render game definitions from the terminal. No interactive scoring, no persistence, no UI. This milestone proves the data model works before building anything visual.

### ~~Phase 0.1: Project scaffold~~ (done)

1. Initialize the project (`npm init`, `tsconfig.json`).
2. Install dependencies: `smol-toml`, `zod`, `chalk`, `vitest`, `typescript`.
3. Set up directory structure:
   ```
   src/
     types/        # TypeScript interfaces (from ARCHITECTURE.md)
     schemas/      # Zod schemas per game type
     cli/          # CLI entry point and command handlers
     scoring/      # Scoring table generation
     loader/       # TOML file loading and parsing
   games/          # TOML files (already exist)
   ```
4. Configure `tsconfig.json` (strict mode, ES2022, Node module resolution).
5. Add npm scripts: `build`, `test`, `dev` (ts-node or tsx for development).
6. Add a CLI entry point (`src/cli/index.ts`) that parses args and dispatches.

### ~~Phase 0.2: Types and schemas~~ (done)

1. Define TypeScript interfaces in `src/types/game.ts` (from ARCHITECTURE.md TypeScript Types section).
2. Define Zod schemas in `src/schemas/`:
   - `base.ts` — Common base schema (game, players, scorecard, rules).
   - `dice-cumulative.ts` — Cumulative dice schema.
   - `dice-category.ts` — Category dice schema.
   - `card.ts` — Card game schema.
   - `list.ts` — List game schema.
   - `index.ts` — Schema registry mapping `game.type` (and `scoring.method` for dice) to the right schema.
3. Write validation tests: each existing TOML file should pass its schema. Write intentionally broken TOMLs as negative test cases.

### ~~Phase 0.3: TOML loader~~ (done)

1. Build a loader (`src/loader/index.ts`) that:
   - Reads a TOML file from disk.
   - Parses it with smol-toml.
   - Detects game type from `game.type`.
   - Validates against the corresponding Zod schema.
   - Returns a typed `GameDefinition` or throws with structured errors.
2. Build a registry loader that reads all files from `games/` and returns a `Record<string, GameDefinition>`.
3. Write tests for the loader: valid files load correctly, invalid files produce clear errors.

### ~~Phase 0.4: CLI commands~~ (done)

1. **`scorekeep list`** — Load all games, print id/name/description table.
2. **`scorekeep validate [game-id]`** — Validate one or all games, print results with ✓/✗ markers.
3. **`scorekeep info <game-id>`** — Print full game reference (rules, scoring, scorecard config).
4. **`scorekeep score-table <game-id>`** — Print scoring reference table only.
5. Implement `--no-color`, `--json`, `--help` flags.
6. Build a small table renderer for box-drawing output.
7. Write snapshot tests for CLI output.

### ~~Phase 0.5: Scoring table generation~~ (done, folded into 0.4)

1. Implement scoring table computation for cumulative dice games (expand singles + of_a_kind rules into a display table).
2. Implement scoring table computation for category dice games (upper faces with max scores, lower categories with score/range).
3. Implement card value display for card games.
4. Write tests for scoring table generation.

### ~~Phase 0.6: Polish~~ (done)

1. Error messages: ensure all validation errors reference TOML paths and are human-readable.
2. Edge cases: empty `games/` directory, malformed TOML syntax, missing required fields, extra unknown fields.
3. README: update with CLI usage and examples.
4. Run all tests, fix any gaps.

### P0 deliverable

A working CLI that:
- Parses and validates all four game TOMLs.
- Prints game info, scoring tables, and rules to the terminal.
- Reports clear validation errors for broken TOMLs.
- Has a test suite covering schemas, loading, scoring, and CLI output.

## Future Phases (outlined, not planned)

### P1 — Web app scaffold

- Vite + React + TypeScript project setup.
- TOML-to-TypeScript build plugin (replaces CLI loader with build-time compilation).
- Tailwind CSS setup.
- Tab-based navigation shell (Home, New Game, Score Sheet, Leaderboard).
- Home page with game list.

### P2 — Score entry

- Game session data model and persistence (localStorage or IndexedDB).
- Score entry UI per game type (accumulator, direct, category-select).
- Scoreboard display per layout type (running-total, category-grid, golf-card, list-vertical/horizontal).
- Auto-save after each change.
- Info popover with rules and scoring reference.

### P3 — Game flow and player management

- Player profiles (names, stats).
- New game flow (select game, add players, start session).
- Game completion and winner determination.
- Recent games on home page.

### P4 — Leaderboard and stats

- Cross-game statistics.
- Per-player win/loss records.
- Leaderboard views.

### P5+ — Advanced features

- More game definitions (swoop, village idiot, other dice/card games).
- Gameplay style detection.
- Player groups/cohorts.
- PWA / offline support.
