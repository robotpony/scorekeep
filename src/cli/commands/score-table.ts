import type { CliOptions } from '../index.js';

export async function scoreTable(gameId: string | undefined, _options: CliOptions): Promise<void> {
  if (!gameId) {
    console.error('  Error: game ID required. Usage: scorekeep score-table <game-id>');
    process.exit(1);
  }
  console.log(`  (score-table command for "${gameId}" — not yet implemented)`);
}
