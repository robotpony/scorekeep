# Libraries

Dependencies for Scorekeep. Chosen for minimal footprint, TypeScript support, and no unnecessary abstraction.

## TOML Parsing — smol-toml

**Package**: `smol-toml`

Parses TOML files into plain JavaScript objects. Chosen over alternatives:

| Library | Size | TOML spec | Notes |
|---------|------|-----------|-------|
| **smol-toml** | ~8 KB | 1.0 compliant | Fast, zero dependencies, good error messages |
| @ltd/j-toml | ~25 KB | 1.0 compliant | More features, larger |
| @iarna/toml | ~15 KB | 0.5 | Outdated spec version |
| toml (npm) | ~10 KB | 0.4 | Very outdated |

smol-toml covers everything we need: tables, arrays of tables, multiline strings, inline tables. The TOML files use standard features only.

## Schema Validation — zod

**Package**: `zod`

Validates parsed TOML objects against game-type schemas and infers TypeScript types from the same schema definition. One source of truth for both runtime validation and compile-time types.

Why not alternatives:
- **io-ts**: More complex API, fp-ts dependency.
- **yup**: Weaker TypeScript inference, designed for form validation.
- **ajv (JSON Schema)**: Requires separate type definitions; schema format is verbose for this use case.
- **Manual validation**: Works for simple cases but doesn't scale cleanly across four game types with per-field error messages.

Zod schemas will live in `src/schemas/` with one file per game type plus a shared base.

## CLI Framework — None (manual arg parsing)

The CLI has four commands (`list`, `info`, `validate`, `score-table`), a few flags (`--no-color`, `--json`, `--help`), and one optional positional argument (game ID). This is simple enough that a framework adds more weight than value.

Implementation: a small `parseArgs` function using Node's built-in `process.argv` or `node:util parseArgs` (available since Node 18.3).

Why not alternatives:
- **commander**: Good library, but overkill for 4 commands with minimal options.
- **yargs**: Heavy, complex API surface.
- **citty/cleye**: Reasonable lightweight options, but still unnecessary for this scope.

If the CLI grows beyond ~8 commands or needs subcommand nesting, reconsider.

## Terminal Output — chalk

**Package**: `chalk`

Colour and formatting for terminal output. Automatically detects TTY and disables colour in piped output. The de facto standard for Node CLI colour.

Why not alternatives:
- **picocolors**: Smaller (~0.4 KB vs. ~1.5 KB for chalk 5), but lacks some formatting (bold, dim). Worth reconsidering if chalk feels heavy.
- **kleur**: Similar to picocolors, slightly more features. Reasonable alternative.
- **ansi-colors**: Heavier than chalk with no advantage.
- **No library**: ANSI escape codes directly work but are error-prone and don't handle TTY detection.

If the dependency budget is tight, picocolors is a fine substitute. The API surface we need is: bold, dim, green, red.

## Tables — none (custom)

Box-drawing tables are simple enough to build in ~50 lines: measure column widths, pad cells, draw borders with `─│┌┐└┘├┤┬┴┼`. No library needed.

Why not alternatives:
- **cli-table3**: Capable but adds a dependency for something we can do in a small utility function.
- **tty-table**: Feature-rich, heavyweight.

## Testing — vitest

**Package**: `vitest` (dev dependency)

Fast, TypeScript-native test runner. Consistent with the future web app stack (Vite + Vitest).

Test structure:
- `src/schemas/*.test.ts` — Schema validation tests (valid TOMLs pass, invalid TOMLs fail with expected errors).
- `src/scoring/*.test.ts` — Scoring table generation tests.
- `src/cli/*.test.ts` — CLI output tests (snapshot-based for rendered output).
- `games/*.test.ts` — Integration tests that validate all TOML files against schemas.

## TypeScript

**Package**: `typescript` (dev dependency)

Strict mode enabled. Target ES2022+ (Node 18+).

## Web App — React + Vite + Tailwind (P1)

### React + React DOM

**Packages**: `react`, `react-dom`

The UI framework. React's component model works well for the polymorphic score entry UI (different components per game type, same data flow). The ecosystem is mature and well-documented.

Why not alternatives:
- **Preact**: Smaller, but the size difference matters less in a local-first app.
- **Svelte/Solid**: Good frameworks, but React has better library support for the patterns we need.
- **Vanilla/Web Components**: Too much boilerplate for the interactive scoring UI in P2+.

### React Router

**Package**: `react-router-dom`

Hash-based routing for the tab navigation. The app has 4 primary routes (Home, New Game, Score Sheet, Leaderboard). Hash routing works without a server, which suits the local-first model.

Why not alternatives:
- **TanStack Router**: More powerful (type-safe routes, file-based generation) but heavier setup for 4 routes.
- **State-based**: Simpler, but loses browser back button, URL sharing, and bookmarkability.

### Vite

**Package**: `vite`, `@vitejs/plugin-react` (dev dependencies)

Build tool and dev server. Already aligned with Vitest. Fast HMR, simple config, handles TypeScript and JSX out of the box.

Why not alternatives:
- **webpack**: More configuration, slower, no advantage for this project.
- **esbuild direct**: Fast but no dev server or HMR without manual setup.
- **Parcel**: Zero-config appeal, but Vite is already in the ecosystem via Vitest.

### Tailwind CSS

**Package**: `tailwindcss`, `@tailwindcss/vite` (dev dependencies)

Utility-first CSS framework. Styles live in the markup, no separate stylesheet management. Good for mobile-first responsive design with breakpoint prefixes (`sm:`, `md:`, `lg:`).

No component library on top. The app is small enough that hand-built components from Tailwind utilities are simpler than adopting shadcn/ui or Radix. If accessibility patterns become complex in P2, reconsider headless UI primitives.

Why not alternatives:
- **CSS Modules**: Fine for scoping, but more files to manage and no utility-class speed.
- **styled-components/emotion**: Runtime CSS-in-JS adds bundle weight and complexity.
- **Plain CSS**: Works, but responsive design and dark mode are verbose without utilities.

## Summary

| Purpose | Package | Dev/Prod | Phase |
|---------|---------|----------|-------|
| TOML parsing | smol-toml | prod | P0 |
| Schema validation | zod | prod | P0 |
| Terminal colour | chalk | prod | P0 |
| UI framework | react, react-dom | prod | P1 |
| Routing | react-router-dom | prod | P1 |
| Build tool | vite, @vitejs/plugin-react | dev | P1 |
| Styling | tailwindcss, @tailwindcss/vite | dev | P1 |
| Testing | vitest | dev | P0 |
| TypeScript | typescript | dev | P0 |

Production dependencies: 6 (3 CLI, 3 web). Dev dependencies: 6.
