import type { CliOptions } from '../index.js';
import { loadGame, loadAllGames, defaultGamesDir, gameFilePath, LoadError } from '../../loader/index.js';
import { generateScoringReference } from '../../scoring/index.js';
import { isListGame } from '../../types/game.js';
import type { GameDefinition } from '../../types/game.js';
import { fmt, renderTable, printSection } from '../format.js';

export async function scoreTable(gameId: string | undefined, options: CliOptions): Promise<void> {
  if (!gameId) {
    console.error('  Error: game ID required. Usage: scorekeep score-table <game-id>');
    process.exit(1);
  }

  const gamesDir = defaultGamesDir();
  let def: GameDefinition;

  try {
    const result = loadGame(gameFilePath(gamesDir, gameId));
    def = result.definition;
  } catch (err) {
    if (err instanceof LoadError && err.phase === 'read') {
      const c = fmt();
      const { games } = loadAllGames(gamesDir);
      const ids = Object.keys(games).sort();
      console.log();
      console.log(`  ${c.red('Error:')} No game definition found for "${gameId}"`);
      if (ids.length > 0) {
        console.log(`  Available games: ${ids.join(', ')}`);
      }
      console.log();
    } else {
      console.error(`  Error: ${err instanceof Error ? err.message : String(err)}`);
    }
    process.exit(1);
  }

  if (options.json) {
    const ref = generateScoringReference(def);
    console.log(JSON.stringify(ref, null, 2));
    return;
  }

  const c = fmt();
  console.log();
  console.log(`  ${c.bold(def.game.name)} — Scoring Reference`);

  if (isListGame(def)) {
    console.log();
    console.log(`  No scoring reference — scores are summed directly.`);
    console.log();
    return;
  }

  const ref = generateScoringReference(def);

  for (const section of ref.sections) {
    if (section.title) {
      printSection([`  ${c.bold(section.title)}`]);
    }

    if (section.entries.length > 0) {
      const tableLines = renderTable({
        columns: [
          { header: 'Name', align: 'left' },
          { header: section.title === 'Lower Section' ? 'Score' : section.title === 'Upper Section' ? 'Range' : 'Points', align: 'right' },
        ],
        rows: section.entries.map((e) => [e.label, e.value]),
      });

      if (!section.title) {
        printSection(tableLines);
      } else {
        tableLines.forEach((line) => console.log(line));
      }
    }

    if (section.note) {
      if (section.entries.length === 0) {
        printSection([`  ${section.note}`]);
      } else {
        console.log();
        console.log(`  ${section.note}`);
      }
    }
  }

  console.log();
}
