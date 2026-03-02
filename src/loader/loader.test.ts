import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { loadGame, loadAllGames, defaultGamesDir, gameFilePath, LoadError } from './index.js';

const GAMES_DIR = defaultGamesDir();
const TMP_DIR = resolve(import.meta.dirname, '../../.test-tmp');

function setupTmpDir() {
  mkdirSync(TMP_DIR, { recursive: true });
}

function cleanTmpDir() {
  rmSync(TMP_DIR, { recursive: true, force: true });
}

// --- loadGame: positive tests ---

describe('loadGame', () => {
  it('loads dice-5.toml', () => {
    const result = loadGame(resolve(GAMES_DIR, 'dice-5.toml'));
    expect(result.definition.game.id).toBe('dice-5');
    expect(result.definition.game.type).toBe('dice');
    expect(result.schemaKey).toBe('dice-cumulative');
  });

  it('loads yahtzee.toml', () => {
    const result = loadGame(resolve(GAMES_DIR, 'yahtzee.toml'));
    expect(result.definition.game.id).toBe('yahtzee');
    expect(result.schemaKey).toBe('dice-category');
  });

  it('loads golf-4.toml', () => {
    const result = loadGame(resolve(GAMES_DIR, 'golf-4.toml'));
    expect(result.definition.game.id).toBe('golf-4');
    expect(result.definition.game.type).toBe('card');
    expect(result.schemaKey).toBe('card');
  });

  it('loads list-simple.toml', () => {
    const result = loadGame(resolve(GAMES_DIR, 'list-simple.toml'));
    expect(result.definition.game.id).toBe('list-simple');
    expect(result.schemaKey).toBe('list');
  });

  it('includes the file path in the result', () => {
    const filePath = resolve(GAMES_DIR, 'dice-5.toml');
    const result = loadGame(filePath);
    expect(result.filePath).toBe(filePath);
  });
});

// --- loadGame: error cases ---

describe('loadGame errors', () => {
  it('throws LoadError for missing file', () => {
    try {
      loadGame('/nonexistent/path.toml');
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(LoadError);
      const loadErr = err as LoadError;
      expect(loadErr.phase).toBe('read');
      expect(loadErr.filePath).toBe('/nonexistent/path.toml');
    }
  });

  it('throws LoadError for malformed TOML', () => {
    setupTmpDir();
    try {
      const filePath = resolve(TMP_DIR, 'bad.toml');
      writeFileSync(filePath, '[game\nbroken toml syntax');
      try {
        loadGame(filePath);
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(LoadError);
        const loadErr = err as LoadError;
        expect(loadErr.phase).toBe('parse');
        expect(loadErr.message).toContain('TOML parse error');
      }
    } finally {
      cleanTmpDir();
    }
  });

  it('throws LoadError for valid TOML that fails schema validation', () => {
    setupTmpDir();
    try {
      const filePath = resolve(TMP_DIR, 'incomplete.toml');
      writeFileSync(filePath, `
[game]
id = "bad"
name = "Bad Game"
type = "dice"
description = "Missing everything else"

[scoring]
method = "cumulative"
`);
      try {
        loadGame(filePath);
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(LoadError);
        const loadErr = err as LoadError;
        expect(loadErr.phase).toBe('validate');
        expect(loadErr.schemaKey).toBe('dice-cumulative');
        expect(loadErr.details).toBeDefined();
        expect(loadErr.details!.length).toBeGreaterThan(0);
      }
    } finally {
      cleanTmpDir();
    }
  });

  it('throws LoadError for unknown game type', () => {
    setupTmpDir();
    try {
      const filePath = resolve(TMP_DIR, 'unknown.toml');
      writeFileSync(filePath, `
[game]
id = "unknown"
name = "Unknown"
type = "board"
description = "Unknown type"
`);
      try {
        loadGame(filePath);
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(LoadError);
        const loadErr = err as LoadError;
        expect(loadErr.phase).toBe('validate');
      }
    } finally {
      cleanTmpDir();
    }
  });
});

// --- loadAllGames ---

describe('loadAllGames', () => {
  it('loads all games from the default directory', () => {
    const { games, results, errors } = loadAllGames(GAMES_DIR);
    expect(errors).toHaveLength(0);
    expect(Object.keys(games)).toHaveLength(4);
    expect(games['dice-5']).toBeDefined();
    expect(games['yahtzee']).toBeDefined();
    expect(games['golf-4']).toBeDefined();
    expect(games['list-simple']).toBeDefined();
    expect(results).toHaveLength(4);
  });

  it('returns game IDs from the TOML content, not filenames', () => {
    const { results } = loadAllGames(GAMES_DIR);
    const ids = results.map((r) => r.gameId);
    expect(ids).toContain('dice-5');
    expect(ids).toContain('yahtzee');
    expect(ids).toContain('golf-4');
    expect(ids).toContain('list-simple');
  });

  it('collects errors without stopping on failure', () => {
    setupTmpDir();
    try {
      // One valid, one broken
      writeFileSync(resolve(TMP_DIR, 'good.toml'), `
[game]
id = "good"
name = "Good"
type = "list"
description = "A good game"

[players]
min = 2
max = 4

[scoring]
winner = "highest"

[scorecard]
layout = "list-vertical"
entry = "direct"
`);
      writeFileSync(resolve(TMP_DIR, 'bad.toml'), `
[game]
id = "bad"
name = "Bad"
type = "dice"
description = "Missing fields"

[scoring]
method = "cumulative"
`);

      const { games, errors } = loadAllGames(TMP_DIR);
      expect(Object.keys(games)).toHaveLength(1);
      expect(games['good']).toBeDefined();
      expect(errors).toHaveLength(1);
      expect(errors[0].phase).toBe('validate');
    } finally {
      cleanTmpDir();
    }
  });

  it('throws LoadError for nonexistent directory', () => {
    expect(() => loadAllGames('/nonexistent/dir')).toThrow(LoadError);
  });

  it('returns empty results for directory with no TOML files', () => {
    setupTmpDir();
    try {
      const { games, results, errors } = loadAllGames(TMP_DIR);
      expect(Object.keys(games)).toHaveLength(0);
      expect(results).toHaveLength(0);
      expect(errors).toHaveLength(0);
    } finally {
      cleanTmpDir();
    }
  });
});

// --- Error message quality ---

describe('validation error messages', () => {
  it('shows expected values for enum/union fields', () => {
    setupTmpDir();
    try {
      const filePath = resolve(TMP_DIR, 'bad-enum.toml');
      writeFileSync(filePath, `
[game]
id = "test"
name = "Test"
type = "dice"
description = "Testing union errors"

[players]
min = 2
max = 8

[scoring]
method = "cumulative"
target = 100
entry_threshold = 50
endgame = "bogus"
winner = "highest"

[scoring.singles]
1 = 100
5 = 50

[scoring.of_a_kind]
3 = "face_value_times"
count_multiplier = 1

[equipment]
type = "dice"
count = 5
sides = 6

[rules]
turn_flow = ["Roll"]
key_rules = ["Score"]

[scorecard]
layout = "running-total"
entry = "accumulator"
`);
      try {
        loadGame(filePath);
        expect.fail('Should have thrown');
      } catch (err) {
        const loadErr = err as LoadError;
        expect(loadErr.phase).toBe('validate');
        const endgameErr = loadErr.details?.find((d) => d.includes('endgame'));
        expect(endgameErr).toBeDefined();
        expect(endgameErr).toContain('Expected');
        expect(endgameErr).toContain('immediate');
        expect(endgameErr).toContain('final-round');
      }
    } finally {
      cleanTmpDir();
    }
  });

  it('shows specific type errors for wrong field types', () => {
    setupTmpDir();
    try {
      const filePath = resolve(TMP_DIR, 'bad-type.toml');
      writeFileSync(filePath, `
[game]
id = "test"
name = "Test"
type = "dice"
description = "Testing type errors"

[players]
min = 2
max = 8

[scoring]
method = "cumulative"
target = "not-a-number"
entry_threshold = 50
endgame = "immediate"
winner = "highest"

[scoring.singles]
1 = 100
5 = 50

[scoring.of_a_kind]
3 = "face_value_times"
count_multiplier = 1

[equipment]
type = "dice"
count = 5
sides = 6

[rules]
turn_flow = ["Roll"]
key_rules = ["Score"]

[scorecard]
layout = "running-total"
entry = "accumulator"
`);
      try {
        loadGame(filePath);
        expect.fail('Should have thrown');
      } catch (err) {
        const loadErr = err as LoadError;
        expect(loadErr.phase).toBe('validate');
        const targetErr = loadErr.details?.find((d) => d.includes('target'));
        expect(targetErr).toBeDefined();
        expect(targetErr).toContain('expected number');
      }
    } finally {
      cleanTmpDir();
    }
  });

  it('shows path-qualified errors for missing nested fields', () => {
    setupTmpDir();
    try {
      const filePath = resolve(TMP_DIR, 'missing-nested.toml');
      writeFileSync(filePath, `
[game]
id = "test"
name = "Test"
type = "dice"
description = "Testing missing fields"

[players]
min = 2
max = 8

[scoring]
method = "cumulative"
`);
      try {
        loadGame(filePath);
        expect.fail('Should have thrown');
      } catch (err) {
        const loadErr = err as LoadError;
        expect(loadErr.phase).toBe('validate');
        // Errors should reference TOML paths like "equipment" or "scoring.target"
        expect(loadErr.details!.some((d) => d.includes('equipment'))).toBe(true);
        expect(loadErr.details!.some((d) => d.includes('scoring.'))).toBe(true);
      }
    } finally {
      cleanTmpDir();
    }
  });
});

// --- Utility functions ---

describe('utility functions', () => {
  it('defaultGamesDir points to the games/ directory', () => {
    const dir = defaultGamesDir();
    expect(dir).toContain('games');
  });

  it('gameFilePath constructs the correct path', () => {
    const path = gameFilePath('/some/dir', 'dice-5');
    expect(path).toBe('/some/dir/dice-5.toml');
  });
});
