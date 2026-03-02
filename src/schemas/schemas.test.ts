import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse as parseToml } from 'smol-toml';
import { diceCumulativeSchema } from './dice-cumulative.js';
import { diceCategorySchema } from './dice-category.js';
import { cardGameSchema } from './card.js';
import { listGameSchema } from './list.js';
import { resolveSchemaKey, validateGameDefinition, safeValidateGameDefinition } from './index.js';

const GAMES_DIR = resolve(import.meta.dirname, '../../games');

function loadToml(filename: string): unknown {
  const content = readFileSync(resolve(GAMES_DIR, filename), 'utf-8');
  return parseToml(content);
}

// --- Positive tests: real TOML files pass validation ---

describe('dice-5.toml (cumulative dice)', () => {
  const raw = loadToml('dice-5.toml');

  it('resolves to dice-cumulative schema', () => {
    expect(resolveSchemaKey(raw)).toBe('dice-cumulative');
  });

  it('passes cumulative dice schema validation', () => {
    const result = diceCumulativeSchema.safeParse(raw);
    expect(result.success).toBe(true);
  });

  it('has correct game metadata', () => {
    const game = diceCumulativeSchema.parse(raw);
    expect(game.game.id).toBe('dice-5');
    expect(game.game.type).toBe('dice');
    expect(game.scoring.method).toBe('cumulative');
    expect(game.scoring.target).toBe(10000);
    expect(game.scoring.entry_threshold).toBe(1000);
    expect(game.scoring.increment).toBe(50);
    expect(game.scoring.endgame).toBe('immediate');
  });

  it('has scoring rules', () => {
    const game = diceCumulativeSchema.parse(raw);
    expect(game.scoring.singles['1']).toBe(100);
    expect(game.scoring.singles['5']).toBe(50);
    expect(game.scoring.of_a_kind.min).toBe(3);
    expect(game.scoring.of_a_kind.multiplier).toBe(100);
    expect(game.scoring.of_a_kind.overrides['1']).toBe(1000);
  });

  it('has rules section', () => {
    const game = diceCumulativeSchema.parse(raw);
    expect(game.rules.turn_flow.length).toBeGreaterThan(0);
    expect(game.rules.key_rules.length).toBeGreaterThan(0);
  });

  it('passes via validateGameDefinition', () => {
    expect(() => validateGameDefinition(raw)).not.toThrow();
  });
});

describe('yahtzee.toml (category dice)', () => {
  const raw = loadToml('yahtzee.toml');

  it('resolves to dice-category schema', () => {
    expect(resolveSchemaKey(raw)).toBe('dice-category');
  });

  it('passes category dice schema validation', () => {
    const result = diceCategorySchema.safeParse(raw);
    expect(result.success).toBe(true);
  });

  it('has correct game metadata', () => {
    const game = diceCategorySchema.parse(raw);
    expect(game.game.id).toBe('yahtzee');
    expect(game.scoring.method).toBe('category-total');
    expect(game.scoring.rounds).toBe(13);
    expect(game.scoring.rolls_per_turn).toBe(3);
    expect(game.scoring.winner).toBe('highest');
  });

  it('has upper section config', () => {
    const game = diceCategorySchema.parse(raw);
    expect(game.scoring.upper.faces).toEqual([1, 2, 3, 4, 5, 6]);
    expect(game.scoring.upper.bonus_threshold).toBe(63);
    expect(game.scoring.upper.bonus_value).toBe(35);
  });

  it('has lower section categories', () => {
    const game = diceCategorySchema.parse(raw);
    expect(game.scoring.lower.length).toBe(7);
    const fullHouse = game.scoring.lower.find((c) => c.name === 'Full House');
    expect(fullHouse?.score).toBe(25);
    const threeOfAKind = game.scoring.lower.find((c) => c.name === 'Three of a Kind');
    expect(threeOfAKind?.range).toEqual([0, 30]);
  });

  it('has yahtzee bonus', () => {
    const game = diceCategorySchema.parse(raw);
    expect(game.scoring.yahtzee_bonus.value).toBe(100);
  });
});

describe('golf-4.toml (card game)', () => {
  const raw = loadToml('golf-4.toml');

  it('resolves to card schema', () => {
    expect(resolveSchemaKey(raw)).toBe('card');
  });

  it('passes card game schema validation', () => {
    const result = cardGameSchema.safeParse(raw);
    expect(result.success).toBe(true);
  });

  it('has correct game metadata', () => {
    const game = cardGameSchema.parse(raw);
    expect(game.game.id).toBe('golf-4');
    expect(game.game.type).toBe('card');
    expect(game.scoring.rounds).toBe(9);
  });

  it('has hand scoring config', () => {
    const game = cardGameSchema.parse(raw);
    expect(game.scoring.hand.winner).toBe('lowest');
    expect(game.scoring.hand.tie).toBe('carryover');
  });

  it('has card values', () => {
    const game = cardGameSchema.parse(raw);
    expect(game.scoring.card_values.ace).toBe(1);
    expect(game.scoring.card_values.king).toBe(0);
    expect(game.scoring.card_values.queen).toBe(12);
  });

  it('has final scoring config', () => {
    const game = cardGameSchema.parse(raw);
    expect(game.scoring.final.metric).toBe('hand-wins');
    expect(game.scoring.final.lowest_cumulative_bonus).toBe(2);
    expect(game.scoring.final.winner).toBe('highest');
  });

  it('has scorecard with mark_winner', () => {
    const game = cardGameSchema.parse(raw);
    expect(game.scorecard.mark_winner).toBe(true);
  });
});

describe('list-simple.toml (list game)', () => {
  const raw = loadToml('list-simple.toml');

  it('resolves to list schema', () => {
    expect(resolveSchemaKey(raw)).toBe('list');
  });

  it('passes list game schema validation', () => {
    const result = listGameSchema.safeParse(raw);
    expect(result.success).toBe(true);
  });

  it('has correct game metadata', () => {
    const game = listGameSchema.parse(raw);
    expect(game.game.id).toBe('list-simple');
    expect(game.game.type).toBe('list');
    expect(game.scoring.winner).toBe('highest');
  });

  it('has no rules section (optional)', () => {
    const game = listGameSchema.parse(raw);
    expect(game.rules).toBeUndefined();
  });
});

// --- Negative tests: broken inputs fail validation ---

describe('schema validation rejects invalid data', () => {
  it('rejects unknown game type', () => {
    expect(() => resolveSchemaKey({ game: { type: 'board' } })).toThrow('Unknown game.type');
  });

  it('rejects unknown dice scoring method', () => {
    expect(() => resolveSchemaKey({
      game: { type: 'dice' },
      scoring: { method: 'points' },
    })).toThrow('Unknown scoring.method');
  });

  it('rejects missing game.type', () => {
    expect(() => resolveSchemaKey({})).toThrow();
  });

  it('rejects cumulative dice with missing target', () => {
    const raw = loadToml('dice-5.toml') as Record<string, unknown>;
    const scoring = { ...(raw.scoring as Record<string, unknown>) };
    delete scoring.target;
    const broken = { ...raw, scoring };
    const result = diceCumulativeSchema.safeParse(broken);
    expect(result.success).toBe(false);
  });

  it('rejects cumulative dice with string increment', () => {
    const raw = loadToml('dice-5.toml') as Record<string, unknown>;
    const scoring = { ...(raw.scoring as Record<string, unknown>), increment: 'fifty' };
    const broken = { ...raw, scoring };
    const result = diceCumulativeSchema.safeParse(broken);
    expect(result.success).toBe(false);
  });

  it('rejects category dice with missing lower categories', () => {
    const raw = loadToml('yahtzee.toml') as Record<string, unknown>;
    const scoring = { ...(raw.scoring as Record<string, unknown>) };
    delete scoring.lower;
    const broken = { ...raw, scoring };
    const result = diceCategorySchema.safeParse(broken);
    expect(result.success).toBe(false);
  });

  it('rejects category with both score and range', () => {
    const raw = loadToml('yahtzee.toml') as Record<string, unknown>;
    const scoring = { ...(raw.scoring as Record<string, unknown>) };
    scoring.lower = [{ name: 'Bad', rule: 'invalid', score: 25, range: [0, 30] }];
    const broken = { ...raw, scoring };
    const result = diceCategorySchema.safeParse(broken);
    expect(result.success).toBe(false);
  });

  it('rejects card game with missing equipment', () => {
    const raw = loadToml('golf-4.toml') as Record<string, unknown>;
    const broken = { ...raw };
    delete broken.equipment;
    const result = cardGameSchema.safeParse(broken);
    expect(result.success).toBe(false);
  });

  it('rejects card game with invalid hand.tie value', () => {
    const raw = loadToml('golf-4.toml') as Record<string, unknown>;
    const scoring = { ...(raw.scoring as Record<string, unknown>) };
    scoring.hand = { winner: 'lowest', tie: 'invalid' };
    const broken = { ...raw, scoring };
    const result = cardGameSchema.safeParse(broken);
    expect(result.success).toBe(false);
  });

  it('rejects list game with invalid winner value', () => {
    const broken = {
      game: { id: 'bad', name: 'Bad', type: 'list', description: 'Bad' },
      players: { min: 2, max: 4 },
      scoring: { winner: 'fastest' },
      scorecard: { layout: 'list-vertical', entry: 'direct' },
    };
    const result = listGameSchema.safeParse(broken);
    expect(result.success).toBe(false);
  });

  it('rejects players with min > max', () => {
    const broken = {
      game: { id: 'bad', name: 'Bad', type: 'list', description: 'Bad' },
      players: { min: 8, max: 2 },
      scoring: { winner: 'highest' },
      scorecard: { layout: 'list-vertical', entry: 'direct' },
    };
    const result = listGameSchema.safeParse(broken);
    expect(result.success).toBe(false);
  });

  it('reports errors via safeValidateGameDefinition', () => {
    const broken = {
      game: { id: 'bad', name: 'Bad', type: 'dice', description: 'Bad' },
      scoring: { method: 'cumulative' },
    };
    const result = safeValidateGameDefinition(broken);
    expect(result.success).toBe(false);
    expect(result.key).toBe('dice-cumulative');
  });
});
