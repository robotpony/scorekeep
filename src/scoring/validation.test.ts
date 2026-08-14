import { describe, it, expect } from 'vitest';
import { games } from '../definitions/games.js';
import type { DiceCumulativeGame, DiceCategoryGame } from '../types/game.js';
import type { CumulativeGameSession, CategoryGameSession } from '../types/session.js';
import {
  validateCumulativeEntry,
  validateCategoryEntry,
  validateListEntry,
  validateCardEntry,
} from './validation.js';

const dice5 = games['dice-5'] as DiceCumulativeGame;
const yahtzee = games['yahtzee'] as DiceCategoryGame;

function makeCumulativeSession(scores: number[][] = [[], []]): CumulativeGameSession {
  return {
    id: 'test', game_id: 'dice-5', players: ['A', 'B'], status: 'active',
    type: 'cumulative', scores, current_player: 0, pending_score: 0,
    created_at: '', updated_at: '',
  };
}

function makeCategorySession(categoryScores: Record<string, number>[] = [{}, {}]): CategoryGameSession {
  return {
    id: 'test', game_id: 'yahtzee', players: ['A', 'B'], status: 'active',
    type: 'category', category_scores: categoryScores, yahtzee_bonuses: [0, 0],
    current_player: 0, created_at: '', updated_at: '',
  };
}

describe('validateCumulativeEntry', () => {
  it('accepts zero (Farkle)', () => {
    const r = validateCumulativeEntry(0, 0, makeCumulativeSession(), dice5);
    expect(r.valid).toBe(true);
  });

  it('rejects negative scores', () => {
    const r = validateCumulativeEntry(-100, 0, makeCumulativeSession(), dice5);
    expect(r.valid).toBe(false);
  });

  it('rejects scores not a multiple of increment (50)', () => {
    const r = validateCumulativeEntry(75, 0, makeCumulativeSession([[1000], []]), dice5);
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/multiple of 50/);
  });

  it('accepts scores that are multiples of increment', () => {
    const r = validateCumulativeEntry(150, 0, makeCumulativeSession([[1000], []]), dice5);
    expect(r.valid).toBe(true);
  });

  it('rejects first score below entry threshold (1000)', () => {
    const r = validateCumulativeEntry(500, 0, makeCumulativeSession(), dice5);
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/at least 1000/);
  });

  it('accepts first score at or above entry threshold', () => {
    const r = validateCumulativeEntry(1000, 0, makeCumulativeSession(), dice5);
    expect(r.valid).toBe(true);
  });

  it('accepts score below threshold after player is on the board', () => {
    const r = validateCumulativeEntry(100, 0, makeCumulativeSession([[1000], []]), dice5);
    expect(r.valid).toBe(true);
  });
});

describe('validateCategoryEntry', () => {
  it('rejects negative scores', () => {
    const r = validateCategoryEntry('Ones', -1, 0, makeCategorySession(), yahtzee);
    expect(r.valid).toBe(false);
  });

  it('rejects already-filled category', () => {
    const r = validateCategoryEntry('Ones', 3, 0, makeCategorySession([{ Ones: 3 }, {}]), yahtzee);
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/already filled/);
  });

  it('validates upper face: accepts valid score', () => {
    const r = validateCategoryEntry('Threes', 9, 0, makeCategorySession(), yahtzee);
    expect(r.valid).toBe(true);
  });

  it('validates upper face: accepts zero', () => {
    const r = validateCategoryEntry('Fours', 0, 0, makeCategorySession(), yahtzee);
    expect(r.valid).toBe(true);
  });

  it('validates upper face: rejects score above max', () => {
    const r = validateCategoryEntry('Ones', 6, 0, makeCategorySession(), yahtzee);
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/Maximum.*5/);
  });

  it('validates upper face: rejects non-multiple of face', () => {
    const r = validateCategoryEntry('Threes', 7, 0, makeCategorySession(), yahtzee);
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/multiple of 3/);
  });

  it('validates fixed-value category: accepts 0 or exact value', () => {
    expect(validateCategoryEntry('Full House', 0, 0, makeCategorySession(), yahtzee).valid).toBe(true);
    expect(validateCategoryEntry('Full House', 25, 0, makeCategorySession(), yahtzee).valid).toBe(true);
  });

  it('validates fixed-value category: rejects other values', () => {
    const r = validateCategoryEntry('Full House', 15, 0, makeCategorySession(), yahtzee);
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/0 or 25/);
  });

  it('validates range category: accepts within range', () => {
    expect(validateCategoryEntry('Chance', 15, 0, makeCategorySession(), yahtzee).valid).toBe(true);
    expect(validateCategoryEntry('Chance', 5, 0, makeCategorySession(), yahtzee).valid).toBe(true);
    expect(validateCategoryEntry('Chance', 30, 0, makeCategorySession(), yahtzee).valid).toBe(true);
  });

  it('validates range category: accepts zero (scratch)', () => {
    expect(validateCategoryEntry('Chance', 0, 0, makeCategorySession(), yahtzee).valid).toBe(true);
  });

  it('validates range category: rejects out of range', () => {
    const r = validateCategoryEntry('Chance', 31, 0, makeCategorySession(), yahtzee);
    expect(r.valid).toBe(false);
  });

  it('rejects unknown category', () => {
    const r = validateCategoryEntry('Nonsense', 5, 0, makeCategorySession(), yahtzee);
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/Unknown category/);
  });
});

describe('validateListEntry', () => {
  it('accepts any finite number', () => {
    expect(validateListEntry(42).valid).toBe(true);
    expect(validateListEntry(0).valid).toBe(true);
    expect(validateListEntry(-5).valid).toBe(true);
  });

  it('rejects non-finite values', () => {
    expect(validateListEntry(Infinity).valid).toBe(false);
    expect(validateListEntry(NaN).valid).toBe(false);
  });
});

describe('validateCardEntry', () => {
  it('accepts non-negative numbers', () => {
    expect(validateCardEntry(0).valid).toBe(true);
    expect(validateCardEntry(12).valid).toBe(true);
  });

  it('rejects negative scores', () => {
    expect(validateCardEntry(-1).valid).toBe(false);
  });

  it('rejects non-finite values', () => {
    expect(validateCardEntry(NaN).valid).toBe(false);
  });
});
