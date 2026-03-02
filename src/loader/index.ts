import { readFileSync, readdirSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { parse as parseToml } from 'smol-toml';
import { safeValidateGameDefinition } from '../schemas/index.js';
import type { GameDefinition } from '../types/game.js';
import type { SchemaKey } from '../schemas/index.js';

export class LoadError extends Error {
  constructor(
    message: string,
    public readonly filePath: string,
    public readonly phase: 'read' | 'parse' | 'validate',
    public readonly details?: string[],
    public readonly schemaKey?: SchemaKey,
  ) {
    super(message);
    this.name = 'LoadError';
  }
}

export interface LoadResult {
  definition: GameDefinition;
  filePath: string;
  schemaKey: SchemaKey;
}

/**
 * Load and validate a single game definition TOML file.
 */
export function loadGame(filePath: string): LoadResult {
  // Read
  let content: string;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new LoadError(`Cannot read file: ${msg}`, filePath, 'read');
  }

  // Parse TOML
  let raw: unknown;
  try {
    raw = parseToml(content);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new LoadError(`TOML parse error: ${msg}`, filePath, 'parse');
  }

  // Validate against schema
  const result = safeValidateGameDefinition(raw);
  if (!result.success) {
    const details = formatValidationErrors(result.error);
    throw new LoadError(
      `Schema validation failed`,
      filePath,
      'validate',
      details,
      result.key,
    );
  }

  return {
    definition: result.data,
    filePath,
    schemaKey: result.key,
  };
}

/**
 * Load and validate all .toml files from a directory.
 * Returns a record keyed by game ID.
 */
export function loadAllGames(gamesDir: string): {
  games: Record<string, GameDefinition>;
  results: Array<{ filePath: string; gameId: string; schemaKey: SchemaKey }>;
  errors: LoadError[];
} {
  let files: string[];
  try {
    files = readdirSync(gamesDir)
      .filter((f) => f.endsWith('.toml'))
      .sort();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new LoadError(`Cannot read games directory: ${msg}`, gamesDir, 'read');
  }

  const games: Record<string, GameDefinition> = {};
  const results: Array<{ filePath: string; gameId: string; schemaKey: SchemaKey }> = [];
  const errors: LoadError[] = [];

  for (const file of files) {
    const filePath = resolve(gamesDir, file);
    try {
      const result = loadGame(filePath);
      const gameId = result.definition.game.id;
      games[gameId] = result.definition;
      results.push({ filePath, gameId, schemaKey: result.schemaKey });
    } catch (err) {
      if (err instanceof LoadError) {
        errors.push(err);
      } else {
        errors.push(new LoadError(
          err instanceof Error ? err.message : String(err),
          filePath,
          'read',
        ));
      }
    }
  }

  return { games, results, errors };
}

/**
 * Resolve the default games directory relative to the project root.
 */
export function defaultGamesDir(): string {
  // Walk up from src/loader/ to project root, then into games/
  return resolve(import.meta.dirname, '../../games');
}

/**
 * Find the file path for a game by its ID.
 * Convention: game ID maps to `{id}.toml` in the games directory.
 */
export function gameFilePath(gamesDir: string, gameId: string): string {
  return resolve(gamesDir, `${gameId}.toml`);
}

function formatValidationErrors(error: Error): string[] {
  if ('issues' in error && Array.isArray((error as Record<string, unknown>).issues)) {
    const issues = (error as Record<string, unknown>).issues as Array<{
      path?: (string | number)[];
      message?: string;
    }>;
    return issues.map((issue) => {
      const path = issue.path?.join('.') || '(root)';
      return `${path}: ${issue.message ?? 'Invalid'}`;
    });
  }
  return [error.message];
}
