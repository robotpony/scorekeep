# Changelog

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
