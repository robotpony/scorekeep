import { describe, it, expect, beforeAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const outFile = resolve(root, 'src/definitions/games.ts');

describe('generate-definitions', () => {
  beforeAll(() => {
    execFileSync('npx', ['tsx', 'scripts/generate-definitions.ts'], {
      cwd: root,
      stdio: 'pipe',
    });
  });

  it('produces a file at src/definitions/games.ts', () => {
    expect(existsSync(outFile)).toBe(true);
  });

  it('exports a games record with all 4 game IDs', async () => {
    const mod = await import(outFile);
    expect(Object.keys(mod.games)).toHaveLength(4);
    expect(mod.games).toHaveProperty('dice-5');
    expect(mod.games).toHaveProperty('yahtzee');
    expect(mod.games).toHaveProperty('golf-4');
    expect(mod.games).toHaveProperty('list-simple');
  });

  it('exports gameList sorted by name', async () => {
    const mod = await import(outFile);
    const names = mod.gameList.map((g: { game: { name: string } }) => g.game.name);
    const sorted = [...names].sort((a: string, b: string) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  it('exports gameIds sorted', async () => {
    const mod = await import(outFile);
    const sorted = [...mod.gameIds].sort();
    expect(mod.gameIds).toEqual(sorted);
  });

  it('each game has the correct game.type', async () => {
    const mod = await import(outFile);
    expect(mod.games['dice-5'].game.type).toBe('dice');
    expect(mod.games['yahtzee'].game.type).toBe('dice');
    expect(mod.games['golf-4'].game.type).toBe('card');
    expect(mod.games['list-simple'].game.type).toBe('list');
  });

  it('exits with error on invalid TOML directory', () => {
    expect(() => {
      execFileSync('npx', ['tsx', 'scripts/generate-definitions.ts'], {
        cwd: root,
        stdio: 'pipe',
        env: { ...process.env, SCOREKEEP_GAMES_DIR: '/nonexistent' },
      });
    }).toThrow();
  });
});
