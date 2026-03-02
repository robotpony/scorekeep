# Plan

Phased implementation plan for Scorekeep. P0 (CLI) and P1 (web scaffold) are scoped in detail. Future phases are outlined for context but will be planned when we get there.

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

## P1 — Web App Scaffold

Goal: Build the web app shell with navigation, game list, and designed empty states for all tabs. Proves the TOML-to-web pipeline works and establishes the mobile-first layout.

### Key decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Project structure | Single project, web in `src/app/` | Shared code (schemas, types, scoring) imported directly. No workspace overhead. |
| TOML pipeline | Generated module (`src/definitions/games.ts`) | Build script reads TOMLs, validates, writes typed exports. No plugin magic. |
| Routing | React Router (hash-based) | Works for local-first app with no server. Standard, lightweight. |
| Styling | Tailwind CSS utilities only | No component library. App is small and custom. Minimal dependencies. |
| Layout | Mobile-first, bottom tab bar | Primary use case is on-the-road scoring from a phone. |
| npm scripts | Namespaced (`dev:web`, `build:web`) | CLI scripts unchanged. `npm test` runs everything. |
| Generated code | Gitignored | Source of truth is `games/*.toml`. Generated file is a build artifact. |

### Phase 1.1: Web stack setup + TOML build script

1. Add dependencies: `react`, `react-dom`, `react-router-dom`.
2. Add dev dependencies: `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`.
3. Create `vite.config.ts` with React plugin, Tailwind plugin, and output to `dist-web/`.
4. Create `tsconfig.web.json` extending base config (add `jsx: react-jsx`, `module: ESNext`).
5. Create `index.html` entry point and `src/app/main.tsx` (React root).
6. Create `src/app/app.css` with Tailwind imports.
7. Create `scripts/generate-definitions.ts`:
   - Reads `games/*.toml`, validates with existing schemas.
   - Writes `src/definitions/games.ts` with typed exports.
   - Exports: `games` (Record), `gameList` (sorted array), `gameIds` (string[]).
8. Add `src/definitions/` to `.gitignore`.
9. Add npm scripts: `generate`, `dev:web` (generate + vite), `build:web` (generate + vite build), `preview:web`.
10. Verify: dev server starts, shows a hello-world page, hot reload works.
11. Tests: generate script produces valid TypeScript with all 4 games.

### Phase 1.2: App shell and routing

1. Create `src/app/layout/AppShell.tsx` — outer layout with content area + tab bar.
2. Create `src/app/layout/TabBar.tsx` — bottom navigation bar.
   - 4 tabs: Home, New Game, Score Sheet, Leaderboard.
   - Simple SVG icons (inline, no icon library).
   - Active tab highlighted.
   - Responsive: bottom bar on mobile, top bar on `md:` and above.
3. Set up `HashRouter` with 4 routes: `/`, `/new`, `/score`, `/leaderboard`.
4. Each route wrapped in `AppShell` layout.
5. Tests: tab bar renders, navigation between routes works, active state matches route.

### Phase 1.3: Home page with game cards

1. Create `src/app/pages/HomePage.tsx`.
2. Create `src/app/components/GameCard.tsx` — card showing game name, description, type badge.
   - Type badges: "Dice", "Card", "List" with distinct colours.
   - Cards are tappable (link to `/new?game=<id>` for future use, non-functional now).
3. Game list sourced from generated `gameList`.
4. Responsive grid: 1 column on mobile, 2 on `sm:`, 3 on `lg:`.
5. Tests: renders all 4 games, displays names and descriptions, type badges correct.

### Phase 1.4: Stub pages with designed empty states

1. **New Game** (`/new`): Header "Start a new game", game list (reuse `GameCard`), "Play" buttons (disabled, non-functional). Note: "Player setup coming soon."
2. **Score Sheet** (`/score`): Centered empty state — icon, "No active game" heading, "Start a new game" link to `/new`.
3. **Leaderboard** (`/leaderboard`): Centered empty state — icon, "No games played yet" heading, "Play your first game" link to `/new`.
4. Tests: each page renders its empty state content and links.

### Phase 1.5: Polish

1. Colour scheme: define palette in Tailwind config (neutral base, accent colour for interactive elements).
2. Dark mode: `prefers-color-scheme` via Tailwind `dark:` classes.
3. Error boundary at app root with fallback UI.
4. Accessible: semantic HTML (`nav`, `main`), focus-visible states, ARIA labels on tab bar.
5. Responsive verification: test at 375px (phone), 768px (tablet), 1024px (desktop).
6. Run all tests (CLI + web), fix gaps.
7. Update CHANGELOG, README (add web section), bump version.

### P1 deliverable

A working web app that:
- Loads game definitions compiled from TOML at build time.
- Renders a mobile-first navigation shell with 4 tabs.
- Shows a game list on the home page with type-appropriate cards.
- Displays designed empty states for New Game, Score Sheet, and Leaderboard.
- Has a test suite covering the build pipeline, navigation, and page rendering.

## Future Phases (outlined, not planned)

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
