import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const CLI = resolve(import.meta.dirname, 'index.ts');
const CWD = resolve(import.meta.dirname, '../..');

function run(...args: string[]): string {
  return execFileSync('npx', ['tsx', CLI, ...args, '--no-color'], {
    encoding: 'utf-8',
    cwd: CWD,
    env: { ...process.env, NO_COLOR: '1' },
  }).trim();
}

function runFail(...args: string[]): { stdout: string; stderr: string; code: number } {
  try {
    const stdout = execFileSync('npx', ['tsx', CLI, ...args, '--no-color'], {
      encoding: 'utf-8',
      cwd: CWD,
      env: { ...process.env, NO_COLOR: '1' },
    });
    return { stdout: stdout.trim(), stderr: '', code: 0 };
  } catch (err: unknown) {
    const e = err as { stdout: string; stderr: string; status: number };
    return { stdout: e.stdout?.trim() ?? '', stderr: e.stderr?.trim() ?? '', code: e.status };
  }
}

// --- Help and argument handling ---

describe('CLI basics', () => {
  it('prints usage with --help', () => {
    const output = run('--help');
    expect(output).toContain('scorekeep');
    expect(output).toContain('Commands:');
  });

  it('prints usage with no arguments', () => {
    const output = run();
    expect(output).toContain('Usage:');
  });

  it('exits with error for unknown command', () => {
    const result = runFail('nonexistent');
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('Unknown command');
  });

  it('requires game ID for info', () => {
    const result = runFail('info');
    expect(result.code).not.toBe(0);
  });

  it('requires game ID for score-table', () => {
    const result = runFail('score-table');
    expect(result.code).not.toBe(0);
  });
});

// --- list command ---

describe('list command', () => {
  it('shows all 4 games', () => {
    const output = run('list');
    expect(output).toContain('Games (4)');
    expect(output).toContain('dice-5');
    expect(output).toContain('yahtzee');
    expect(output).toContain('golf-4');
    expect(output).toContain('list-simple');
  });

  it('shows game names and descriptions', () => {
    const output = run('list');
    expect(output).toContain('Dice 5');
    expect(output).toContain('Roll five dice');
  });

  it('outputs JSON with --json', () => {
    const output = run('list', '--json');
    const data = JSON.parse(output);
    expect(data).toHaveLength(4);
    expect(data[0]).toHaveProperty('id');
    expect(data[0]).toHaveProperty('name');
    expect(data[0]).toHaveProperty('type');
    expect(data[0]).toHaveProperty('description');
  });
});

// --- validate command ---

describe('validate command', () => {
  it('validates all games successfully', () => {
    const output = run('validate');
    expect(output).toContain('✓ dice-5.toml');
    expect(output).toContain('✓ yahtzee.toml');
    expect(output).toContain('✓ golf-4.toml');
    expect(output).toContain('✓ list-simple.toml');
    expect(output).toContain('4 games validated, 0 errors');
  });

  it('validates a single game', () => {
    const output = run('validate', 'dice-5');
    expect(output).toContain('✓ dice-5.toml');
    expect(output).toContain('1 game validated, 0 errors');
  });

  it('exits with error for nonexistent game', () => {
    const result = runFail('validate', 'nonexistent');
    expect(result.code).toBe(1);
  });

  it('outputs JSON with --json', () => {
    const output = run('validate', '--json');
    const data = JSON.parse(output);
    expect(data.total).toBe(4);
    expect(data.valid).toBe(4);
    expect(data.errors).toBe(0);
  });
});

// --- info command ---

describe('info command', () => {
  it('shows dice-5 game info', () => {
    const output = run('info', 'dice-5');
    expect(output).toContain('Dice 5');
    expect(output).toContain('Players: 2–8');
    expect(output).toContain('6-sided dice');
    expect(output).toContain('Rules');
    expect(output).toContain('Turn flow');
    expect(output).toContain('Key rules');
    expect(output).toContain('Single 1');
    expect(output).toContain('100');
    expect(output).toContain('Scorecard');
    expect(output).toContain('running-total');
  });

  it('shows yahtzee game info', () => {
    const output = run('info', 'yahtzee');
    expect(output).toContain('Yahtzee');
    expect(output).toContain('Upper Section');
    expect(output).toContain('Lower Section');
    expect(output).toContain('Full House');
    expect(output).toContain('category-grid');
  });

  it('shows golf-4 game info', () => {
    const output = run('info', 'golf-4');
    expect(output).toContain('Golf 4');
    expect(output).toContain('Card Values');
    expect(output).toContain('Modifiers');
    expect(output).toContain('King');
  });

  it('shows list-simple game info', () => {
    const output = run('info', 'list-simple');
    expect(output).toContain('Simple Scores');
    expect(output).toContain('summed directly');
  });

  it('shows error for nonexistent game', () => {
    const result = runFail('info', 'nonexistent');
    expect(result.code).not.toBe(0);
    expect(result.stdout).toContain('No game definition found');
    expect(result.stdout).toContain('Available games');
  });

  it('outputs JSON with --json', () => {
    const output = run('info', 'dice-5', '--json');
    const data = JSON.parse(output);
    expect(data.game.id).toBe('dice-5');
    expect(data.scoring.method).toBe('cumulative');
  });
});

// --- score-table command ---

describe('score-table command', () => {
  it('shows dice-5 scoring table', () => {
    const output = run('score-table', 'dice-5');
    expect(output).toContain('Dice 5 — Scoring Reference');
    expect(output).toContain('Single 1');
    expect(output).toContain('Three 1s');
    expect(output).toContain('┌');
    expect(output).toContain('┘');
  });

  it('shows yahtzee scoring table', () => {
    const output = run('score-table', 'yahtzee');
    expect(output).toContain('Yahtzee — Scoring Reference');
    expect(output).toContain('Upper Section');
    expect(output).toContain('Lower Section');
    expect(output).toContain('Yahtzee Bonus');
  });

  it('shows golf-4 scoring table', () => {
    const output = run('score-table', 'golf-4');
    expect(output).toContain('Golf 4 — Scoring Reference');
    expect(output).toContain('Card Values');
  });

  it('shows list-simple message', () => {
    const output = run('score-table', 'list-simple');
    expect(output).toContain('scores are summed directly');
  });

  it('shows error for nonexistent game', () => {
    const result = runFail('score-table', 'nonexistent');
    expect(result.code).not.toBe(0);
  });

  it('outputs JSON with --json', () => {
    const output = run('score-table', 'dice-5', '--json');
    const data = JSON.parse(output);
    expect(data.sections).toBeDefined();
    expect(data.sections[0].entries.length).toBeGreaterThan(0);
  });
});
