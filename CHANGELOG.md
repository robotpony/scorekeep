# Changelog

## 0.5.0

- Improved validation error messages: union/enum fields now show expected values (e.g. `Expected "immediate" or "final-round"`) instead of generic "Invalid input"
- README updated with real CLI output examples for all commands
- 3 new error message quality tests (103 total)

## 0.4.0

- CLI commands fully implemented: `list`, `validate`, `info`, `score-table`
- Box-drawing table renderer with auto-sizing columns and right-aligned numerics
- Scoring table generation for all game types:
  - Cumulative dice: expand singles + of-a-kind rules into full combo table
  - Category dice: upper section faces with ranges, lower section categories
  - Card games: card values, modifiers, final scoring note
  - List games: "scores are summed directly" note
- `--no-color` flag disables chalk output
- `--json` flag outputs structured JSON for all commands
- `validate` exits with code 1 on failure, reports per-field Zod errors
- `info` shows "not found" with available game IDs on missing game
- 42 new tests: 20 scoring generation, 5 table renderer, 24 CLI command tests (100 total)

## 0.3.0

- TOML file loader: `loadGame(filePath)` reads, parses, and validates a single game definition
- Registry loader: `loadAllGames(gamesDir)` loads all `.toml` files, continues on errors
- `LoadError` class with structured error phases (`read`, `parse`, `validate`) and detail messages
- Utility functions: `defaultGamesDir()`, `gameFilePath()`
- 16 loader tests (positive tests for all 4 games, error cases for missing files, malformed TOML, schema failures, unknown types, empty directories)

## 0.2.0

- Zod schemas for all four game types: cumulative dice, category dice, card, list
- TypeScript types inferred from Zod schemas (single source of truth)
- Schema registry with auto-dispatch based on `game.type` and `scoring.method`
- `validateGameDefinition` and `safeValidateGameDefinition` functions
- Type guard functions: `isDiceGame`, `isCardGame`, `isListGame`, `isCumulativeDice`, `isCategoryDice`
- 35 schema validation tests (positive tests for all 4 TOMLs, negative tests for broken inputs)

## 0.1.0

- Project scaffold: package.json, tsconfig.json, directory structure
- CLI entry point with arg parsing and command dispatch
- Stub handlers for `list`, `info`, `validate`, `score-table` commands
- Support for `--help`, `--no-color`, `--json` flags
- Test suite for CLI scaffold (7 tests)
- Game definition TOMLs: dice-5, yahtzee, golf-4, list-simple
- Architecture, design, libraries, and plan documentation
