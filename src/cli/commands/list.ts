import type { CliOptions } from '../index.js';
import { loadAllGames, defaultGamesDir } from '../../loader/index.js';
import { fmt } from '../format.js';

export async function list(options: CliOptions): Promise<void> {
  const { games, errors } = loadAllGames(defaultGamesDir());

  if (options.json) {
    const entries = Object.values(games).map((g) => ({
      id: g.game.id,
      name: g.game.name,
      type: g.game.type,
      description: g.game.description,
    }));
    console.log(JSON.stringify(entries, null, 2));
    return;
  }

  const c = fmt();
  const entries = Object.values(games)
    .sort((a, b) => a.game.id.localeCompare(b.game.id));

  console.log();
  console.log(`  ${c.bold('Games')} (${entries.length})`);
  console.log();

  // Compute column widths for alignment
  const idWidth = Math.max(...entries.map((e) => e.game.id.length));
  const nameWidth = Math.max(...entries.map((e) => e.game.name.length));

  for (const entry of entries) {
    const id = entry.game.id.padEnd(idWidth);
    const name = entry.game.name.padEnd(nameWidth);
    console.log(`  ${id}  ${c.bold(name)}  ${c.dim(entry.game.description)}`);
  }

  if (errors.length > 0) {
    console.log();
    console.log(`  ${c.red('Errors:')} ${errors.length} file(s) failed to load`);
    for (const err of errors) {
      console.log(`    ${c.red('✗')} ${err.filePath}: ${err.message}`);
    }
  }

  console.log();
}
