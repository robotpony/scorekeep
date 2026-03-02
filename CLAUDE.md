# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Scorekeep is a score-tracking tool for card and dice games, built for use on the road. Game rules and scoring logic are defined in TOML files under `games/`. The current milestone (P0) is a CLI that parses, validates, and renders game definitions. A web app (Vite + React) is planned for future phases.

## Tech Stack (P0 — CLI)

- **Language:** TypeScript (strict mode, ES2022, ESM)
- **TOML parsing:** smol-toml
- **Schema validation:** Zod
- **Terminal output:** chalk
- **Testing:** Vitest
- **Dev runner:** tsx

## Commands

```bash
npm run dev                     # Run CLI via tsx
npm run dev -- list             # Run a specific CLI command
npm run dev -- info dice-5      # Show game info
npm run dev -- validate         # Validate all game TOMLs
npm run build                   # Compile TypeScript to dist/
npm test                        # Run all tests
npm run lint                    # Type-check without emitting
```

## Project Structure

```
src/
  cli/          # CLI entry point and command handlers
  types/        # TypeScript interfaces for game definitions
  schemas/      # Zod schemas per game type
  loader/       # TOML file loading and parsing
  scoring/      # Scoring table generation
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
