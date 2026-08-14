import type { GameDefinition, DiceCumulativeGame, DiceCategoryGame, CardGameDefinition } from '../types/game.js';
import type { GameSession, CumulativeGameSession, CategoryGameSession, HandWinnerGameSession, ListGameSession } from '../types/session.js';
import { isDiceGame, isCardGame, isListGame, isCumulativeDice } from '../types/game.js';

/**
 * Check if a game session is over based on the game definition.
 * Returns the index of the winning player, or -1 if the game is not over.
 * Returns -2 for "final round" mode (cumulative dice) where remaining players get one turn.
 */
export function checkGameOver(
  session: GameSession,
  def: GameDefinition,
): { over: boolean; winner?: number; finalRound?: boolean } {
  if (isDiceGame(def)) {
    if (isCumulativeDice(def)) {
      return checkCumulativeEndgame(session as CumulativeGameSession, def);
    }
    return checkCategoryEndgame(session as CategoryGameSession, def as DiceCategoryGame);
  }
  if (isCardGame(def)) {
    return checkHandWinnerEndgame(session as HandWinnerGameSession, def);
  }
  if (isListGame(def)) {
    // List games have no automatic end condition; ended manually
    return { over: false };
  }
  return { over: false };
}

function checkCumulativeEndgame(
  session: CumulativeGameSession,
  def: DiceCumulativeGame,
): { over: boolean; winner?: number; finalRound?: boolean } {
  const { target, endgame } = def.scoring;

  for (let i = 0; i < session.players.length; i++) {
    const total = session.scores[i].reduce((a, b) => a + b, 0);
    if (total >= target) {
      if (endgame === 'immediate') {
        return { over: true, winner: i };
      }
      // final-round: check if all players after the triggering player have had their turn
      return { over: false, finalRound: true };
    }
  }

  return { over: false };
}

function checkCategoryEndgame(
  session: CategoryGameSession,
  def: DiceCategoryGame,
): { over: boolean; winner?: number } {
  const totalCategories = def.scoring.upper.faces.length + def.scoring.lower.length;

  for (let i = 0; i < session.players.length; i++) {
    if (Object.keys(session.category_scores[i]).length < totalCategories) {
      return { over: false };
    }
  }

  // All categories filled — game is over
  return { over: true };
}

function checkHandWinnerEndgame(
  session: HandWinnerGameSession,
  def: CardGameDefinition,
): { over: boolean } {
  if (session.hand_winners.length >= def.scoring.rounds) {
    return { over: true };
  }
  return { over: false };
}
