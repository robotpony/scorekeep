import type { DiceCumulativeGame, DiceCategoryGame } from '../types/game.js';
import type { CumulativeGameSession, CategoryGameSession } from '../types/session.js';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const ok: ValidationResult = { valid: true };

function fail(error: string): ValidationResult {
  return { valid: false, error };
}

/**
 * Validate a score entry for a cumulative dice game.
 */
export function validateCumulativeEntry(
  score: number,
  playerIndex: number,
  session: CumulativeGameSession,
  def: DiceCumulativeGame,
): ValidationResult {
  if (score < 0) return fail('Score must be non-negative');
  if (score === 0) return ok; // Farkle is always valid

  const { increment, entry_threshold } = def.scoring;

  if (score % increment !== 0) {
    return fail(`Score must be a multiple of ${increment}`);
  }

  // Check entry threshold: first non-zero score for a player
  const playerScores = session.scores[playerIndex];
  const isOnBoard = playerScores.some(s => s > 0);
  if (!isOnBoard && score < entry_threshold) {
    return fail(`First score must be at least ${entry_threshold}`);
  }

  return ok;
}

/**
 * Validate a category score entry for a category dice game.
 */
export function validateCategoryEntry(
  category: string,
  score: number,
  playerIndex: number,
  session: CategoryGameSession,
  def: DiceCategoryGame,
): ValidationResult {
  if (score < 0) return fail('Score must be non-negative');

  // Check if category is already filled
  const filled = session.category_scores[playerIndex];
  if (category in filled) {
    return fail(`Category "${category}" is already filled`);
  }

  const { upper, lower } = def.scoring;
  const { dice_count } = def.equipment;

  // Check if it's an upper face category
  const face = upper.faces.find(f => categoryNameForFace(f) === category);
  if (face !== undefined) {
    const max = face * dice_count;
    if (score > max) return fail(`Maximum for ${category} is ${max}`);
    if (score !== 0 && score % face !== 0) {
      return fail(`${category} must be a multiple of ${face}`);
    }
    return ok;
  }

  // Check lower categories
  const lowerCat = lower.find(c => c.name === category);
  if (!lowerCat) return fail(`Unknown category "${category}"`);

  if (lowerCat.score !== undefined) {
    // Fixed-value category
    if (score !== 0 && score !== lowerCat.score) {
      return fail(`${category} must be 0 or ${lowerCat.score}`);
    }
    return ok;
  }

  if (lowerCat.range) {
    const [min, max] = lowerCat.range;
    if (score !== 0 && (score < min || score > max)) {
      return fail(`${category} must be 0 or between ${min} and ${max}`);
    }
    return ok;
  }

  return ok;
}

/**
 * No validation for list games beyond being a number.
 */
export function validateListEntry(score: number): ValidationResult {
  if (!Number.isFinite(score)) return fail('Score must be a number');
  return ok;
}

/**
 * No special validation for card hand scores.
 */
export function validateCardEntry(score: number): ValidationResult {
  if (!Number.isFinite(score)) return fail('Score must be a number');
  if (score < 0) return fail('Score must be non-negative');
  return ok;
}

const FACE_NAMES: Record<number, string> = {
  1: 'Ones', 2: 'Twos', 3: 'Threes', 4: 'Fours', 5: 'Fives', 6: 'Sixes',
};

export function categoryNameForFace(face: number): string {
  return FACE_NAMES[face] ?? `${face}s`;
}
