import type { z } from 'zod';
import type { diceCumulativeSchema } from '../schemas/dice-cumulative.js';
import type { diceCategorySchema } from '../schemas/dice-category.js';
import type { cardGameSchema } from '../schemas/card.js';
import type { listGameSchema } from '../schemas/list.js';

// Types inferred from Zod schemas (single source of truth)
export type DiceCumulativeGame = z.infer<typeof diceCumulativeSchema>;
export type DiceCategoryGame = z.infer<typeof diceCategorySchema>;
export type CardGameDefinition = z.infer<typeof cardGameSchema>;
export type ListGameDefinition = z.infer<typeof listGameSchema>;

export type DiceGameDefinition = DiceCumulativeGame | DiceCategoryGame;

export type GameDefinition =
  | DiceCumulativeGame
  | DiceCategoryGame
  | CardGameDefinition
  | ListGameDefinition;

// Type guards
export function isDiceGame(def: GameDefinition): def is DiceGameDefinition {
  return def.game.type === 'dice';
}

export function isCardGame(def: GameDefinition): def is CardGameDefinition {
  return def.game.type === 'card';
}

export function isListGame(def: GameDefinition): def is ListGameDefinition {
  return def.game.type === 'list';
}

export function isCumulativeDice(def: DiceGameDefinition): def is DiceCumulativeGame {
  return def.scoring.method === 'cumulative';
}

export function isCategoryDice(def: DiceGameDefinition): def is DiceCategoryGame {
  return def.scoring.method === 'category-total';
}
