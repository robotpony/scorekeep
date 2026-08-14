import { describe, it, expect } from 'vitest';
import { games } from '../definitions/games.js';
import type { DiceCategoryGame, CardGameDefinition } from '../types/game.js';
import type { CumulativeGameSession, CategoryGameSession, HandWinnerGameSession, ListGameSession } from '../types/session.js';
import { computeFinalScores, determineHandWinner } from './final.js';

const dice5 = games['dice-5'];
const yahtzee = games['yahtzee'] as DiceCategoryGame;
const golf4 = games['golf-4'] as CardGameDefinition;
const listSimple = games['list-simple'];

function base(overrides: Record<string, unknown> = {}) {
  return { id: 'test', players: ['A', 'B'], status: 'finished' as const, created_at: '', updated_at: '', ...overrides };
}

describe('computeFinalScores — cumulative', () => {
  it('sums scores and picks highest', () => {
    const session: CumulativeGameSession = {
      ...base({ game_id: 'dice-5' }),
      type: 'cumulative', scores: [[3000, 4000, 3500], [2000, 5000, 2000]], current_player: 0, pending_score: 0,
    };
    const result = computeFinalScores(session, dice5);
    expect(result.totals).toEqual([10500, 9000]);
    expect(result.winner).toBe(0);
  });
});

describe('computeFinalScores — category', () => {
  it('computes upper bonus when threshold met', () => {
    const scores: Record<string, number> = {
      Ones: 3, Twos: 8, Threes: 12, Fours: 16, Fives: 15, Sixes: 18,
      'Three of a Kind': 20, 'Four of a Kind': 22, 'Full House': 25,
      'Small Straight': 30, 'Large Straight': 40, 'Yahtzee': 50, 'Chance': 22,
    };
    const session: CategoryGameSession = {
      ...base({ game_id: 'yahtzee' }),
      type: 'category',
      category_scores: [scores, { ...scores, Ones: 1, Twos: 2, Threes: 3, Fours: 4, Fives: 5, Sixes: 6 }],
      yahtzee_bonuses: [0, 0], current_player: 0,
    };
    const result = computeFinalScores(session, yahtzee);
    // Player 0: upper = 3+8+12+16+15+18=72, bonus=35, lower=209, total=72+35+209=316
    // Actually let's verify: upper = 72 (>=63 so +35), lower = 20+22+25+30+40+50+22=209
    expect(result.totals[0]).toBe(72 + 35 + 209);
    // Player 1: upper = 1+2+3+4+5+6=21, no bonus, lower=209
    expect(result.totals[1]).toBe(21 + 209);
    expect(result.winner).toBe(0);
  });

  it('adds yahtzee bonuses', () => {
    const scores: Record<string, number> = {
      Ones: 3, Twos: 6, Threes: 9, Fours: 12, Fives: 15, Sixes: 18,
      'Three of a Kind': 20, 'Four of a Kind': 22, 'Full House': 25,
      'Small Straight': 30, 'Large Straight': 40, 'Yahtzee': 50, 'Chance': 22,
    };
    const session: CategoryGameSession = {
      ...base({ game_id: 'yahtzee' }),
      type: 'category', category_scores: [scores, scores],
      yahtzee_bonuses: [2, 0], current_player: 0,
    };
    const result = computeFinalScores(session, yahtzee);
    const baseTotal = 63 + 35 + 209; // upper+bonus+lower
    expect(result.totals[0]).toBe(baseTotal + 200); // 2 yahtzee bonuses × 100
    expect(result.totals[1]).toBe(baseTotal);
  });
});

describe('computeFinalScores — hand-winner', () => {
  it('counts hand wins and adds lowest cumulative bonus', () => {
    const session: HandWinnerGameSession = {
      ...base({ game_id: 'golf-4' }),
      type: 'hand-winner',
      hand_scores: [[3, 5, 4, 6, 3, 5, 4, 3, 2], [5, 8, 7, 3, 6, 4, 7, 5, 8]],
      hand_winners: ['A', 'A', 'A', 'B', 'A', 'B', 'A', 'A', 'A'],
      hand_win_values: [1, 1, 1, 1, 1, 1, 1, 1, 1],
      carryover: 0, current_round: 9,
    };
    const result = computeFinalScores(session, golf4);
    // A won 7 hands, B won 2. A cumulative=35, B cumulative=53. A has lowest cumulative → +2
    expect(result.totals[0]).toBe(7 + 2); // 7 wins + 2 bonus
    expect(result.totals[1]).toBe(2);     // 2 wins
    expect(result.winner).toBe(0);
  });
});

describe('computeFinalScores — list', () => {
  it('sums scores and picks highest', () => {
    const session: ListGameSession = {
      ...base({ game_id: 'list-simple' }),
      type: 'list', scores: [[10, 20, 30], [25, 25, 25]],
    };
    const result = computeFinalScores(session, listSimple);
    expect(result.totals).toEqual([60, 75]);
    expect(result.winner).toBe(1);
  });
});

describe('determineHandWinner', () => {
  it('picks lowest scorer', () => {
    const result = determineHandWinner([3, 5], ['A', 'B'], 'lowest', 'carryover');
    expect(result.winner).toBe('A');
    expect(result.isTie).toBe(false);
  });

  it('returns null on carryover tie', () => {
    const result = determineHandWinner([5, 5], ['A', 'B'], 'lowest', 'carryover');
    expect(result.winner).toBeNull();
    expect(result.isTie).toBe(true);
  });

  it('returns first player on split tie', () => {
    const result = determineHandWinner([5, 5], ['A', 'B'], 'lowest', 'split');
    expect(result.winner).toBe('A');
    expect(result.isTie).toBe(true);
  });

  it('picks highest scorer when configured', () => {
    const result = determineHandWinner([3, 5], ['A', 'B'], 'highest', 'carryover');
    expect(result.winner).toBe('B');
  });
});
