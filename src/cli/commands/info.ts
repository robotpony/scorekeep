import type { CliOptions } from '../index.js';
import { loadGame, loadAllGames, defaultGamesDir, gameFilePath, LoadError } from '../../loader/index.js';
import { generateScoringReference } from '../../scoring/index.js';
import { isDiceGame, isCardGame, isListGame, isCumulativeDice } from '../../types/game.js';
import type { GameDefinition, DiceCumulativeGame } from '../../types/game.js';
import { fmt, renderTable, formatNumber, printSection } from '../format.js';

export async function info(gameId: string | undefined, options: CliOptions): Promise<void> {
  if (!gameId) {
    console.error('  Error: game ID required. Usage: scorekeep info <game-id>');
    process.exit(1);
  }

  const gamesDir = defaultGamesDir();
  let def: GameDefinition;

  try {
    const result = loadGame(gameFilePath(gamesDir, gameId));
    def = result.definition;
  } catch (err) {
    if (err instanceof LoadError && err.phase === 'read') {
      printNotFound(gameId, gamesDir);
    } else {
      console.error(`  Error: ${err instanceof Error ? err.message : String(err)}`);
    }
    process.exit(1);
  }

  if (options.json) {
    console.log(JSON.stringify(def, null, 2));
    return;
  }

  printHeader(def);
  printEquipment(def);
  printRules(def);
  printScoringReference(def);
  printScorecardConfig(def);
  console.log();
}

function printNotFound(gameId: string, gamesDir: string): void {
  const c = fmt();
  const { games } = loadAllGames(gamesDir);
  const ids = Object.keys(games).sort();
  console.log();
  console.log(`  ${c.red('Error:')} No game definition found for "${gameId}"`);
  if (ids.length > 0) {
    console.log(`  Available games: ${ids.join(', ')}`);
  }
  console.log();
}

function printHeader(def: GameDefinition): void {
  const c = fmt();
  console.log();
  console.log(`  ${c.bold(def.game.name)}`);
  console.log(`  ${def.game.description}`);
  console.log();
  console.log(`  Players: ${def.players.min}–${def.players.max}`);
}

function printEquipment(def: GameDefinition): void {
  if (isDiceGame(def)) {
    console.log(`  Equipment: ${def.equipment.dice_count} ${def.equipment.dice_sides}-sided dice`);
  } else if (isCardGame(def)) {
    console.log(`  Equipment: ${def.equipment.deck} deck, ${def.equipment.cards_per_player} cards per player`);
  }
}

function printRules(def: GameDefinition): void {
  const c = fmt();
  if (!def.rules) return;

  printSection([`  ${c.bold('Rules')}`, `  ${def.rules.summary}`]);

  printSection([`  ${c.bold('Turn flow')}`]);
  def.rules.turn_flow.forEach((step, i) => {
    console.log(`  ${i + 1}. ${step}`);
  });

  printSection([`  ${c.bold('Key rules')}`]);
  for (const rule of def.rules.key_rules) {
    console.log(`  • ${rule}`);
  }
}

function printScoringReference(def: GameDefinition): void {
  const c = fmt();
  const ref = generateScoringReference(def);

  for (const section of ref.sections) {
    if (section.title) {
      printSection([`  ${c.bold(section.title)}`]);
    }

    if (section.entries.length > 0) {
      const tableLines = renderTable({
        columns: [
          { header: section.title === 'Upper Section' || section.title === 'Lower Section' ? 'Name' : 'Combo', align: 'left' },
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
      if (section.entries.length === 0 && !section.title) {
        printSection([`  ${section.note}`]);
      } else {
        console.log();
        console.log(`  ${section.note}`);
      }
    }
  }
}

function printScorecardConfig(def: GameDefinition): void {
  const c = fmt();
  printSection([`  ${c.bold('Scorecard')}`]);
  console.log(`  Layout: ${def.scorecard.layout}`);

  let entryStr = def.scorecard.entry as string;
  if ('commit_label' in def.scorecard && def.scorecard.commit_label) {
    const sc = def.scorecard as DiceCumulativeGame['scorecard'];
    const labels = [sc.commit_label, sc.zero_label].filter(Boolean).join(' / ');
    entryStr += ` (${labels})`;
  }
  console.log(`  Entry: ${entryStr}`);

  if (isDiceGame(def) && isCumulativeDice(def)) {
    console.log(`  Target: ${formatNumber(def.scoring.target)} | Threshold: ${formatNumber(def.scoring.entry_threshold)} | Increment: ${def.scoring.increment}`);
  }

  if (def.rules?.turn_order) {
    console.log();
    console.log(`  Turn order: ${def.rules.turn_order}`);
  }
}
