# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Scorekeep is a score-tracking tool for card and dice games, built for use on the road. Game rules and scoring logic are defined in TOML files under `games/`. P0 (CLI) is complete. P1 (web app scaffold) is the current milestone: Vite + React + Tailwind, mobile-first, with a navigation shell and game list.

## Tech Stack

- **Language:** TypeScript (strict mode, ES2022, ESM)
- **TOML parsing:** smol-toml
- **Schema validation:** Zod
- **CLI output:** chalk
- **Web framework:** React + React Router (hash-based)
- **Styling:** Tailwind CSS (utilities only, no component library)
- **Build:** Vite (web), tsc (CLI)
- **Testing:** Vitest
- **Dev runner:** tsx (CLI)

## Commands

```bash
# CLI
npm run dev                     # Run CLI via tsx
npm run dev -- list             # Run a specific CLI command
npm run dev -- info dice-5      # Show game info
npm run build                   # Compile CLI to dist/

# Web
npm run generate                # Compile TOMLs to src/definitions/games.ts
npm run dev:web                 # Generate + start Vite dev server
npm run build:web               # Generate + Vite production build
npm run preview:web             # Preview production web build

# Shared
npm test                        # Run all tests (CLI + web)
npm run lint                    # Type-check without emitting
```

## Project Structure

```
src/
  schemas/      # Zod schemas per game type (shared)
  types/        # TypeScript types for game definitions (shared)
  scoring/      # Scoring table generation (shared)
  loader/       # TOML file loading (CLI + build script, uses Node fs)
  cli/          # CLI entry point and command handlers
  app/          # React web app (P1+)
    layout/     # AppShell, TabBar
    pages/      # Page components
    components/ # Shared UI components
  definitions/  # Generated game definitions (gitignored)
scripts/
  generate-definitions.ts  # TOML → TypeScript build script
games/          # Game definition TOML files
```

## Architecture

See `ARCHITECTURE.md` for the full architecture document. Key points:

- **Game definitions are data-driven** (TOML), not hardcoded. Adding a game = adding a TOML file.
- **Four game types**: cumulative dice, category dice, card (hand-winner), list. Each has its own TOML schema and TypeScript interface.
- **Discriminated unions**: `game.type` narrows to the game type, `scoring.method` narrows dice subtypes.
- **Zod schemas** serve as the single source of truth for both runtime validation and TypeScript type inference.

## Game Types

| Type | Schema key | Example |
|------|-----------|---------|
| Cumulative dice | `type = "dice"`, `scoring.method = "cumulative"` | dice-5 |
| Category dice | `type = "dice"`, `scoring.method = "category-total"` | yahtzee |
| Card | `type = "card"` | golf-4 |
| List | `type = "list"` | list-simple |

# currentDate
Today's date is 2026-03-01.
