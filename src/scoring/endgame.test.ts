import { describe, it, expect } from 'vitest';
import { games } from '../definitions/games.js';
import type { DiceCumulativeGame, DiceCategoryGame, CardGameDefinition } from '../types/game.js';
import type { CumulativeGameSession, CategoryGameSession, HandWinnerGameSession, ListGameSession } from '../types/session.js';
import { checkGameOver } from './endgame.js';

const dice5 = games['dice-5'] as DiceCumulativeGame;
const yahtzee = games['yahtzee'] as DiceCategoryGame;
const golf4 = games['golf-4'] as CardGameDefinition;
const listSimple = games['list-simple'];

function base(overrides: Record<string, unknown> = {}) {
  return { id: 'test', players: ['A', 'B'], status: 'active' as const, created_at: '', updated_at: '', ...overrides };
}

describe('cumulative endgame', () => {
  it('returns not over when no player has reached target', () => {
    const session: CumulativeGameSession = {
      ...base({ game_id: 'dice-5' }),
      type: 'cumulative', scores: [[5000], [3000]], current_player: 0, pending_score: 0,
    };
    expect(checkGameOver(session, dice5).over).toBe(false);
  });

  it('returns over with winner for immediate endgame', () => {
    const session: CumulativeGameSession = {
      ...base({ game_id: 'dice-5' }),
      type: 'cumulative', scores: [[5000, 5000], [3000]], current_player: 0, pending_score: 0,
    };
    const result = checkGameOver(session, dice5);
    expect(result.over).toBe(true);
    expect(result.winner).toBe(0);
  });
});

describe('category endgame', () => {
  it('returns not over when categories remain', () => {
    const session: CategoryGameSession = {
      ...base({ game_id: 'yahtzee' }),
      type: 'category', category_scores: [{ Ones: 3 }, {}], yahtzee_bonuses: [0, 0], current_player: 0,
    };
    expect(checkGameOver(session, yahtzee).over).toBe(false);
  });

  it('returns over when all 13 categories filled for all players', () => {
    const allFilled: Record<string, number> = {
      Ones: 3, Twos: 6, Threes: 9, Fours: 12, Fives: 15, Sixes: 18,
      'Three of a Kind': 20, 'Four of a Kind': 25, 'Full House': 25,
      'Small Straight': 30, 'Large Straight': 40, 'Yahtzee': 50, 'Chance': 22,
    };
    const session: CategoryGameSession = {
      ...base({ game_id: 'yahtzee' }),
      type: 'category', category_scores: [{ ...allFilled }, { ...allFilled }], yahtzee_bonuses: [0, 0], current_player: 0,
    };
    expect(checkGameOver(session, yahtzee).over).toBe(true);
  });
});

describe('hand-winner endgame', () => {
  it('returns not over when rounds remain', () => {
    const session: HandWinnerGameSession = {
      ...base({ game_id: 'golf-4' }),
      type: 'hand-winner', hand_scores: [[5], [8]], hand_winners: ['A'], hand_win_values: [1], carryover: 0, current_round: 1,
    };
    expect(checkGameOver(session, golf4).over).toBe(false);
  });

  it('returns over when all 9 rounds complete', () => {
    const session: HandWinnerGameSession = {
      ...base({ game_id: 'golf-4' }),
      type: 'hand-winner',
      hand_scores: [Array(9).fill(5), Array(9).fill(8)],
      hand_winners: Array(9).fill('A'),
      hand_win_values: Array(9).fill(1),
      carryover: 0, current_round: 9,
    };
    expect(checkGameOver(session, golf4).over).toBe(true);
  });
});

describe('list endgame', () => {
  it('always returns not over (manual end)', () => {
    const session: ListGameSession = {
      ...base({ game_id: 'list-simple' }),
      type: 'list', scores: [[10, 20], [30, 40]],
    };
    expect(checkGameOver(session, listSimple).over).toBe(false);
  });
});
