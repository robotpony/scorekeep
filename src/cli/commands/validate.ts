import { basename } from 'node:path';
import type { CliOptions } from '../index.js';
import { loadGame, loadAllGames, defaultGamesDir, gameFilePath, LoadError } from '../../loader/index.js';
import { fmt } from '../format.js';

export async function validate(gameId: string | undefined, options: CliOptions): Promise<void> {
  const gamesDir = defaultGamesDir();

  if (gameId) {
    await validateOne(gameFilePath(gamesDir, gameId), options);
  } else {
    await validateAll(gamesDir, options);
  }
}

async function validateOne(filePath: string, options: CliOptions): Promise<void> {
  const c = fmt();
  const filename = basename(filePath);

  if (!options.json) {
    console.log();
    console.log(`  Validating ${filename}`);
    console.log();
  }

  try {
    const result = loadGame(filePath);

    if (options.json) {
      console.log(JSON.stringify({
        file: filename,
        valid: true,
        gameId: result.definition.game.id,
        schemaKey: result.schemaKey,
      }, null, 2));
      return;
    }

    console.log(`  ${c.green('✓')} ${filename}`);
    console.log();
    console.log(`  1 game validated, 0 errors`);
    console.log();
  } catch (err) {
    if (options.json) {
      const loadErr = err instanceof LoadError ? err : null;
      console.log(JSON.stringify({
        file: filename,
        valid: false,
        phase: loadErr?.phase ?? 'unknown',
        errors: loadErr?.details ?? [loadErr?.message ?? String(err)],
      }, null, 2));
      process.exit(1);
    }

    if (err instanceof LoadError) {
      printLoadError(err);
    } else {
      console.log(`  ${c.red('✗')} ${filename}`);
      console.log(`    ${err instanceof Error ? err.message : String(err)}`);
    }
    console.log();
    console.log(`  1 game validated, 1 error`);
    console.log();
    process.exit(1);
  }
}

async function validateAll(gamesDir: string, options: CliOptions): Promise<void> {
  const c = fmt();
  const { results, errors } = loadAllGames(gamesDir);
  const total = results.length + errors.length;

  if (options.json) {
    const output = {
      total,
      valid: results.length,
      errors: errors.length,
      results: results.map((r) => ({
        file: basename(r.filePath),
        gameId: r.gameId,
        schemaKey: r.schemaKey,
        valid: true,
      })),
      failures: errors.map((e) => ({
        file: basename(e.filePath),
        phase: e.phase,
        errors: e.details ?? [e.message],
        valid: false,
      })),
    };
    console.log(JSON.stringify(output, null, 2));
    if (errors.length > 0) process.exit(1);
    return;
  }

  console.log();
  console.log(`  Validating games/*.toml`);
  console.log();

  for (const result of results) {
    console.log(`  ${c.green('✓')} ${basename(result.filePath)}`);
  }

  for (const err of errors) {
    printLoadError(err);
  }

  console.log();
  console.log(`  ${total} game${total !== 1 ? 's' : ''} validated, ${errors.length} error${errors.length !== 1 ? 's' : ''}`);
  console.log();

  if (errors.length > 0) {
    process.exit(1);
  }
}

function printLoadError(err: LoadError): void {
  const c = fmt();
  const filename = basename(err.filePath);
  console.log(`  ${c.red('✗')} ${filename}`);

  if (err.details && err.details.length > 0) {
    for (const detail of err.details) {
      console.log(`    ${c.dim(detail)}`);
    }
  } else {
    console.log(`    ${err.message}`);
  }
}
