import type { CliOptions } from '../index.js';

export async function info(gameId: string | undefined, _options: CliOptions): Promise<void> {
  if (!gameId) {
    console.error('  Error: game ID required. Usage: scorekeep info <game-id>');
    process.exit(1);
  }
  console.log(`  (info command for "${gameId}" — not yet implemented)`);
}
