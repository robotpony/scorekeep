# Plan

Phased implementation plan for Scorekeep. P0 (CLI) is complete. P1 (web scaffold) is scoped in detail. P2–P5 are broken into sub-phases with enough detail to plan against.

## P0 — CLI Tool (complete)

Goal: Parse, validate, and render game definitions from the terminal. No interactive scoring, no persistence, no UI. This milestone proves the data model works before building anything visual.

### Phase 0.1: Project scaffold

- [x] Initialize the project (`npm init`, `tsconfig.json`)
- [x] Install dependencies: `smol-toml`, `zod`, `chalk`, `vitest`, `typescript`
- [x] Set up directory structure (`src/types`, `schemas`, `cli`, `scoring`, `loader`, `games/`)
- [x] Configure `tsconfig.json` (strict mode, ES2022, Node module resolution)
- [x] Add npm scripts: `build`, `test`, `dev` (tsx for development)
- [x] Add a CLI entry point (`src/cli/index.ts`) that parses args and dispatches

### Phase 0.2: Types and schemas

- [x] Define TypeScript interfaces in `src/types/game.ts`
- [x] Define Zod schemas: `base.ts`, `dice-cumulative.ts`, `dice-category.ts`, `card.ts`, `list.ts`, `index.ts`
- [x] Write validation tests: each TOML passes its schema, broken TOMLs as negative cases

### Phase 0.3: TOML loader

- [x] Build loader (`src/loader/index.ts`): read, parse, detect type, validate, return typed result
- [x] Build registry loader: reads all files from `games/`, returns `Record<string, GameDefinition>`
- [x] Write tests for valid and invalid file loading

### Phase 0.4: CLI commands

- [x] `scorekeep list` — load all games, print id/name/description table
- [x] `scorekeep validate [game-id]` — validate one or all, print ✓/✗ results
- [x] `scorekeep info <game-id>` — print full game reference
- [x] `scorekeep score-table <game-id>` — print scoring table only
- [x] Implement `--no-color`, `--json`, `--help` flags
- [x] Build table renderer for box-drawing output
- [x] Write tests for CLI output

### Phase 0.5: Scoring table generation (folded into 0.4)

- [x] Scoring table computation for cumulative dice games
- [x] Scoring table computation for category dice games
- [x] Card value display for card games
- [x] Tests for scoring table generation

### Phase 0.6: Polish

- [x] Error messages reference TOML paths and are human-readable
- [x] Edge cases: empty `games/`, malformed TOML, missing fields, unknown fields
- [x] README with CLI usage and examples
- [x] All tests pass (103 across 5 suites)

---

## P1 — Web App Scaffold

Goal: Build the web app shell with navigation, game list, game detail pages, and designed empty states. Proves the TOML-to-web pipeline works and establishes the mobile-first layout.

### Key decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Project structure | Single project, web in `src/app/` | Shared code imported directly. No workspace overhead. |
| TOML pipeline | Generated module (`src/definitions/games.ts`) | Build script reads TOMLs, validates, writes typed exports. |
| Routing | React Router (hash-based) | Works for local-first app with no server. |
| Styling | Tailwind CSS utilities only | No component library. App is small and custom. |
| Layout | Mobile-first, bottom tab bar | Primary use case is on-the-road scoring from a phone. |
| npm scripts | Namespaced (`dev:web`, `build:web`) | CLI scripts unchanged. `npm test` runs everything. |
| Generated code | Gitignored | Source of truth is `games/*.toml`. |

### Phase 1.1: Web stack setup + TOML build script

- [ ] Add dependencies: `react`, `react-dom`, `react-router-dom`
- [ ] Add dev dependencies: `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`
- [ ] Create `vite.config.ts` with React plugin, Tailwind plugin, output to `dist-web/`
- [ ] Create `tsconfig.web.json` extending base config (add `jsx: react-jsx`, `module: ESNext`)
- [ ] Create `index.html` entry point and `src/app/main.tsx` (React root)
- [ ] Create `src/app/app.css` with Tailwind imports
- [ ] Create `scripts/generate-definitions.ts`: reads TOMLs, validates, writes typed exports
- [ ] Add `src/definitions/` to `.gitignore`
- [ ] Add npm scripts: `generate`, `dev:web`, `build:web`, `preview:web`
- [ ] Verify: dev server starts, hello-world page renders, hot reload works
- [ ] Tests: generate script produces valid TypeScript with all 4 games

### Phase 1.2: App shell and routing

- [ ] Create `src/app/layout/AppShell.tsx` — outer layout with content area + tab bar
- [ ] Create `src/app/layout/TabBar.tsx` — bottom nav bar with 4 tabs (Home, New Game, Score Sheet, Leaderboard)
- [ ] Simple SVG icons (inline, no icon library), active tab highlighted
- [ ] Responsive: bottom bar on mobile, top bar on `md:` and above
- [ ] Set up `HashRouter` with routes: `/`, `/new`, `/score`, `/leaderboard`, `/game/:id`
- [ ] Each route wrapped in `AppShell` layout
- [ ] Tests: tab bar renders, navigation works, active state matches route

### Phase 1.3: Home page with game cards

- [ ] Create `src/app/pages/HomePage.tsx`
- [ ] Create `src/app/components/GameCard.tsx` — name, description, type badge (Dice/Card/List with distinct colours)
- [ ] Cards link to `/game/:id` (game detail page)
- [ ] Game list sourced from generated `gameList`
- [ ] Responsive grid: 1 column on mobile, 2 on `sm:`, 3 on `lg:`
- [ ] Tests: renders all 4 games, displays names, descriptions, and type badges

### Phase 1.4: Game detail page

- [ ] Create `src/app/pages/GameDetailPage.tsx` at `/game/:id`
- [ ] Display game name, description, player count, equipment
- [ ] Display rules: summary, turn flow (numbered), key rules (bulleted)
- [ ] Display scoring reference table (reuse `src/scoring/` logic, render as HTML table)
- [ ] "Play this game" button linking to `/new?game=<id>` (non-functional in P1)
- [ ] Handle invalid game ID with redirect or error state
- [ ] Tests: renders game info, scoring table adapts to game type, 404 for unknown IDs

### Phase 1.5: Stub pages with designed empty states

- [ ] **New Game** (`/new`): header "Start a new game", game list with "Play" buttons (disabled), "Player setup coming soon" note
- [ ] **Score Sheet** (`/score`): centered empty state with icon, "No active game" heading, link to `/new`
- [ ] **Leaderboard** (`/leaderboard`): centered empty state with icon, "No games played yet" heading, link to `/new`
- [ ] Tests: each page renders its empty state content and links

### Phase 1.6: Polish

- [ ] Define colour palette in Tailwind config (neutral base, accent colour, type badge colours)
- [ ] Dark mode via `prefers-color-scheme` with Tailwind `dark:` classes
- [ ] Error boundary at app root with fallback UI
- [ ] Accessible: semantic HTML (`nav`, `main`), focus-visible states, ARIA labels on tab bar
- [ ] Responsive verification at 375px, 768px, 1024px
- [ ] All tests pass (CLI + web)
- [ ] Update README with web section, bump version

---

## P2 — Score Entry

Goal: Build the core scoring experience. Players can start a game, enter scores, and see running results. Scores auto-save. Each game type gets a scorecard UI that matches its real-world equivalent.

### Phase 2.1: Persistence layer

- [ ] Choose storage: localStorage for simplicity, IndexedDB if we need indexing (decide based on data volume)
- [ ] Implement session store: create, read, update, list, delete game sessions
- [ ] Session data model from ARCHITECTURE.md (`GameSession` union type)
- [ ] Auto-save on every score change
- [ ] Tests: CRUD operations, persistence across page reloads

### Phase 2.2: New game flow (minimal)

- [ ] Wire up `/new` page: select game, enter player names (2+ text inputs)
- [ ] "Start game" creates a session and navigates to `/score`
- [ ] Validate player count against game's `players.min`/`players.max`
- [ ] Tests: game creation, player count validation, navigation

### Phase 2.3: Score entry — list games

- [ ] Build `list-vertical` / `list-horizontal` scorecard layout
- [ ] Direct number entry per player per round
- [ ] Running totals, winner highlight when game has no fixed round count
- [ ] "End game" action to finalize
- [ ] Tests: score entry, totals, winner determination

### Phase 2.4: Score entry — cumulative dice

- [ ] Build `running-total` scorecard layout (rounds as rows, players as columns)
- [ ] Accumulator entry: buttons derived from scoring rules, with commit/zero (Bank/Farkle) actions
- [ ] Direct-entry fallback for custom scores
- [ ] Entry threshold validation (first score must meet minimum)
- [ ] Increment validation (scores must be multiples of increment)
- [ ] Detect target reached, apply endgame rules (immediate vs. final-round)
- [ ] Tests: entry validation, threshold, target, endgame logic

### Phase 2.5: Score entry — category dice (Yahtzee)

- [ ] Build `category-grid` scorecard layout (upper/lower sections, players as columns)
- [ ] Category-select entry: pick unused category, enter validated score
- [ ] Upper section: face value validation (0 to face × dice_count, in increments of face)
- [ ] Lower section: fixed-value and range validation
- [ ] Upper bonus computation (subtotal ≥ threshold → add bonus)
- [ ] Yahtzee bonus tracking
- [ ] Game complete when all categories filled
- [ ] Tests: category selection, score validation per type, bonus logic, game completion

### Phase 2.6: Score entry — card games (hand-winner)

- [ ] Build `golf-card` scorecard layout (hands as columns, players as rows, winners marked)
- [ ] Direct score entry per player per hand
- [ ] Auto-determine hand winner per `scoring.hand.winner` (lowest/highest)
- [ ] Tie handling: carryover, split, or none per game config
- [ ] Final scoring: hand-wins + lowest_cumulative_bonus
- [ ] Tests: hand winner logic, tie handling, carryover, final scoring

### Phase 2.7: In-game reference

- [ ] Info popover/drawer showing rules and scoring reference during gameplay
- [ ] Triggered by an info icon on the score sheet
- [ ] Reuse scoring table rendering from game detail page
- [ ] Tests: popover opens, shows correct content for game type

### Phase 2.8: Score entry polish

- [ ] Undo last score entry (single-level undo)
- [ ] Touch-friendly input sizing (minimum 44px tap targets)
- [ ] Number pad input mode on mobile (`inputmode="numeric"`)
- [ ] Visual feedback on score entry (brief highlight/animation)
- [ ] Active player / current turn indicator
- [ ] All tests pass

---

## P3 — Game Flow and Player Management

Goal: Players have persistent identities. Games track history. The home page shows recent activity.

### Phase 3.1: Player profiles

- [ ] Player data model: name, ID, created date
- [ ] Player store: create, list, rename, delete
- [ ] Player name autocomplete in new game flow (suggest known players)
- [ ] Tests: CRUD, name uniqueness

### Phase 3.2: Game lifecycle

- [ ] Active game indicator on tab bar (badge or dot on Score tab)
- [ ] Resume active game on app load
- [ ] Game completion: winner determination, mark session as finished
- [ ] "Play again" action (same game, same players, new session)
- [ ] Tests: resume, completion, replay

### Phase 3.3: Home page enhancements

- [ ] Recent games section on home page (last 5 completed games)
- [ ] Active game card with "Continue" action
- [ ] Game history: link to full history view
- [ ] Tests: recent games display, active game card

### Phase 3.4: Game history

- [ ] `/history` page (or section): list of completed games
- [ ] Filter by game type, player
- [ ] Completed game summary: game, players, winner, date
- [ ] Tap to view final scorecard (read-only)
- [ ] Tests: history list, filters, detail view

---

## P4 — Leaderboard and Stats

Goal: Cross-game statistics and player rankings.

### Phase 4.1: Per-player stats

- [ ] Games played, games won, win rate per player
- [ ] Breakdown by game type
- [ ] Best/worst scores where applicable
- [ ] Tests: stat computation from session history

### Phase 4.2: Leaderboard views

- [ ] Overall leaderboard (win rate across all games)
- [ ] Per-game leaderboard
- [ ] Time period filtering (all time, last 30 days, last 7 days)
- [ ] Tests: ranking logic, filtering

### Phase 4.3: Player detail page

- [ ] `/player/:id` with full stats and game history for one player
- [ ] Head-to-head records against other players
- [ ] Tests: player detail rendering, head-to-head computation

---

## P5 — PWA and Offline

Goal: Works fully offline. Installable on phone home screens. Critical for "on the road" use.

- [ ] Service worker for offline support (Vite PWA plugin or Workbox)
- [ ] App manifest with icons and splash screens
- [ ] Offline-first: all data in local storage, no network required
- [ ] Install prompt / "Add to Home Screen" support
- [ ] Cache game definitions and app shell
- [ ] Tests: offline functionality, install flow

---

## P6 — More Games and Advanced Features

Goal: Expand the game library and add quality-of-life features.

- [ ] Additional game definitions (swoop, village idiot, other dice/card games)
- [ ] Custom game creation (user-defined TOML or simplified form)
- [ ] Player groups/cohorts (e.g., "Family," "Game Night")
- [ ] Export/share game results
- [ ] Gameplay style detection (e.g., aggressive vs. conservative scoring patterns)
- [ ] Data export/import for backup
