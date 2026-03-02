import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const CLI = resolve(import.meta.dirname, 'index.ts');

function run(...args: string[]): string {
  return execFileSync('npx', ['tsx', CLI, ...args], {
    encoding: 'utf-8',
    cwd: resolve(import.meta.dirname, '../..'),
    env: { ...process.env, NO_COLOR: '1' },
  }).trim();
}

function runFail(...args: string[]): { stdout: string; stderr: string; code: number } {
  try {
    const stdout = execFileSync('npx', ['tsx', CLI, ...args], {
      encoding: 'utf-8',
      cwd: resolve(import.meta.dirname, '../..'),
      env: { ...process.env, NO_COLOR: '1' },
    });
    return { stdout: stdout.trim(), stderr: '', code: 0 };
  } catch (err: unknown) {
    const e = err as { stdout: string; stderr: string; status: number };
    return { stdout: e.stdout?.trim() ?? '', stderr: e.stderr?.trim() ?? '', code: e.status };
  }
}

describe('CLI scaffold', () => {
  it('prints usage with --help', () => {
    const output = run('--help');
    expect(output).toContain('scorekeep');
    expect(output).toContain('Commands:');
    expect(output).toContain('list');
    expect(output).toContain('info');
    expect(output).toContain('validate');
    expect(output).toContain('score-table');
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

  it('runs list command (stub)', () => {
    const output = run('list');
    expect(output).toContain('not yet implemented');
  });

  it('runs validate command (stub)', () => {
    const output = run('validate');
    expect(output).toContain('not yet implemented');
  });

  it('requires game ID for info command', () => {
    const result = runFail('info');
    expect(result.code).not.toBe(0);
  });

  it('requires game ID for score-table command', () => {
    const result = runFail('score-table');
    expect(result.code).not.toBe(0);
  });
});
