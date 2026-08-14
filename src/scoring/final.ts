import type { GameDefinition, DiceCategoryGame, CardGameDefinition } from '../types/game.js';
import type { GameSession, CumulativeGameSession, CategoryGameSession, HandWinnerGameSession, ListGameSession } from '../types/session.js';
import { isDiceGame, isCardGame, isListGame, isCumulativeDice } from '../types/game.js';
import { categoryNameForFace } from './validation.js';

export interface FinalScores {
  totals: number[];
  winner: number;      // index of winning player
  details?: string[];  // optional per-player breakdown labels
}

/**
 * Compute final scores and determine the winner.
 */
export function computeFinalScores(
  session: GameSession,
  def: GameDefinition,
): FinalScores {
  if (isDiceGame(def)) {
    if (isCumulativeDice(def)) {
      return computeCumulativeFinal(session as CumulativeGameSession);
    }
    return computeCategoryFinal(session as CategoryGameSession, def as DiceCategoryGame);
  }
  if (isCardGame(def)) {
    return computeHandWinnerFinal(session as HandWinnerGameSession, def);
  }
  if (isListGame(def)) {
    return computeListFinal(session as ListGameSession, def);
  }
  return { totals: [], winner: 0 };
}

function computeCumulativeFinal(session: CumulativeGameSession): FinalScores {
  const totals = session.scores.map(rounds => rounds.reduce((a, b) => a + b, 0));
  const winner = totals.indexOf(Math.max(...totals));
  return { totals, winner };
}

function computeCategoryFinal(
  session: CategoryGameSession,
  def: DiceCategoryGame,
): FinalScores {
  const { upper, lower, yahtzee_bonus } = def.scoring;
  const { dice_count } = def.equipment;
  const totals: number[] = [];
  const details: string[] = [];

  for (let i = 0; i < session.players.length; i++) {
    const scores = session.category_scores[i];

    // Upper subtotal
    let upperTotal = 0;
    for (const face of upper.faces) {
      const name = categoryNameForFace(face);
      upperTotal += scores[name] ?? 0;
    }
    const bonus = upperTotal >= upper.bonus_threshold ? upper.bonus_value : 0;

    // Lower subtotal
    let lowerTotal = 0;
    for (const cat of lower) {
      lowerTotal += scores[cat.name] ?? 0;
    }

    // Yahtzee bonuses
    const yahtzeeBonusTotal = session.yahtzee_bonuses[i] * yahtzee_bonus.value;

    const total = upperTotal + bonus + lowerTotal + yahtzeeBonusTotal;
    totals.push(total);
    details.push(`Upper: ${upperTotal}${bonus ? ` +${bonus} bonus` : ''}, Lower: ${lowerTotal}${yahtzeeBonusTotal ? `, Yahtzee bonus: +${yahtzeeBonusTotal}` : ''}`);
  }

  const winner = def.scoring.winner === 'highest'
    ? totals.indexOf(Math.max(...totals))
    : totals.indexOf(Math.min(...totals));

  return { totals, winner, details };
}

function computeHandWinnerFinal(
  session: HandWinnerGameSession,
  def: CardGameDefinition,
): FinalScores {
  const { final } = def.scoring;

  // Count hand wins per player
  const winCounts = session.players.map(() => 0);
  for (let r = 0; r < session.hand_winners.length; r++) {
    const winnerName = session.hand_winners[r];
    if (winnerName !== null) {
      const idx = session.players.indexOf(winnerName);
      if (idx >= 0) {
        winCounts[idx] += session.hand_win_values[r] ?? 1;
      }
    }
  }

  // Lowest cumulative bonus
  const cumulatives = session.hand_scores.map(rounds => rounds.reduce((a, b) => a + b, 0));
  const lowestCum = Math.min(...cumulatives);
  const totals = winCounts.map((wins, i) => {
    let total = wins;
    if (final.lowest_cumulative_bonus > 0 && cumulatives[i] === lowestCum) {
      total += final.lowest_cumulative_bonus;
    }
    return total;
  });

  const winner = final.winner === 'highest'
    ? totals.indexOf(Math.max(...totals))
    : totals.indexOf(Math.min(...totals));

  return { totals, winner };
}

function computeListFinal(
  session: ListGameSession,
  def: { scoring: { winner: 'highest' | 'lowest' } },
): FinalScores {
  const totals = session.scores.map(rounds => rounds.reduce((a, b) => a + b, 0));
  const winner = def.scoring.winner === 'highest'
    ? totals.indexOf(Math.max(...totals))
    : totals.indexOf(Math.min(...totals));
  return { totals, winner };
}

/**
 * Determine the hand winner for a card game round.
 * Returns the player name, or null if tied with carryover.
 */
export function determineHandWinner(
  scores: number[],
  players: string[],
  winnerType: 'lowest' | 'highest',
  tieRule: 'carryover' | 'split' | 'none',
): { winner: string | null; value: number; isTie: boolean } {
  const target = winnerType === 'lowest'
    ? Math.min(...scores)
    : Math.max(...scores);

  const winners = players.filter((_, i) => scores[i] === target);

  if (winners.length === 1) {
    return { winner: winners[0], value: 1, isTie: false };
  }

  // Tie
  if (tieRule === 'carryover') {
    return { winner: null, value: 0, isTie: true };
  }
  if (tieRule === 'split') {
    // In split mode, all tied players get credit — the first one is the "winner" for display
    return { winner: winners[0], value: 1, isTie: true };
  }
  // 'none'
  return { winner: null, value: 0, isTie: true };
}
