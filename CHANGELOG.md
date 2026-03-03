# Changelog

## 0.10.0

- Stub pages with designed empty states (Phase 1.5)
- **New Game** page: game list with type badges and disabled "Play" buttons, "Player setup coming soon" note
- **Score Sheet** page: centered empty state with clipboard icon, "No active game" heading, link to start a game
- **Leaderboard** page: centered empty state with podium icon, "No games played yet" heading, link to start a game
- 10 new tests: page headings, game list rendering, disabled buttons, descriptive text, navigation links (146 total across 10 suites)

## 0.9.0

- Game detail page (Phase 1.4)
- `GameDetailPage` at `/game/:id`: game name, description, player count, equipment, rules (summary, turn flow, key rules), scoring reference table
- `ScoringTable` component: reuses shared `generateScoringReference` logic, renders sections as HTML tables with headers and notes
- "Play this game" button linking to `/new?game=<id>` (non-functional stub for P1)
- Error state for unknown game IDs with back-to-home link
- Scoring adapts per game type: cumulative dice combos, category sections (upper/lower), card values/modifiers, list note
- 11 new tests: game info display, equipment per type, rules rendering, scoring per game type, play link, unknown ID error (136 total across 9 suites)

## 0.8.0

- Home page with game cards (Phase 1.3)
- `GameCard` component: game name, description, type badge (Dice/Card/List with distinct colours)
- Game cards link to `/game/:id` detail page
- Responsive grid layout: 1 column on mobile, 2 on `sm:`, 3 on `lg:`
- 6 new tests: game rendering, descriptions, type badges, link targets, badge colours (125 total across 8 suites)

## 0.7.0

- App shell and routing (Phase 1.2)
- `AppShell` layout component: responsive bottom tab bar on mobile, top bar on md+
- `TabBar` with 4 tabs (Home, New Game, Score Sheet, Leaderboard) using inline SVG icons and active state highlighting
- HashRouter with routes: `/`, `/new`, `/score`, `/leaderboard`, `/game/:id`
- Placeholder page components for all routes
- React component testing setup: @testing-library/react + happy-dom
- 10 new tests: tab rendering, navigation, active state, route matching (119 total across 7 suites)

## 0.6.0

- Web app scaffold (Phase 1.1)
- Vite + React + Tailwind CSS dev stack
- TOML-to-TypeScript build script (`scripts/generate-definitions.ts`)
- Generated game definitions module with typed exports
- Web-specific tsconfig, entry point, CSS imports
- npm scripts: `generate`, `dev:web`, `build:web`, `preview:web`
- 6 new tests for the generate script (109 total across 6 suites)

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
