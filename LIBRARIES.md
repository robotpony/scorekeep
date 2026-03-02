# Libraries

Dependencies for the Scorekeep CLI (P0). Chosen for minimal footprint, TypeScript support, and no unnecessary abstraction.

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

## Summary

| Purpose | Package | Dev/Prod |
|---------|---------|----------|
| TOML parsing | smol-toml | prod |
| Schema validation | zod | prod |
| Terminal colour | chalk | prod |
| Testing | vitest | dev |
| TypeScript | typescript | dev |

Total production dependencies: 3. No framework, no build tool beyond TypeScript for P0.
