import type { CliOptions } from '../index.js';

export async function validate(gameId: string | undefined, _options: CliOptions): Promise<void> {
  if (gameId) {
    console.log(`  (validate command for "${gameId}" — not yet implemented)`);
  } else {
    console.log('  (validate command for all games — not yet implemented)');
  }
}
