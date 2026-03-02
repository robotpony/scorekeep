import { z } from 'zod';
import { diceCumulativeSchema } from './dice-cumulative.js';
import { diceCategorySchema } from './dice-category.js';
import { cardGameSchema } from './card.js';
import { listGameSchema } from './list.js';
import type { GameDefinition } from '../types/game.js';

export { diceCumulativeSchema } from './dice-cumulative.js';
export { diceCategorySchema } from './dice-category.js';
export { cardGameSchema } from './card.js';
export { listGameSchema } from './list.js';

/**
 * Pre-validation schema to extract game.type and scoring.method
 * before dispatching to the full schema.
 */
const preValidationSchema = z.object({
  game: z.object({
    type: z.string(),
  }),
  scoring: z.object({
    method: z.string().optional(),
  }).optional(),
});

export type SchemaKey = 'dice-cumulative' | 'dice-category' | 'card' | 'list';

/**
 * Determine which schema to use based on game.type and scoring.method.
 */
export function resolveSchemaKey(raw: unknown): SchemaKey {
  const pre = preValidationSchema.parse(raw);
  const gameType = pre.game.type;

  switch (gameType) {
    case 'dice': {
      const method = pre.scoring?.method;
      if (method === 'cumulative') return 'dice-cumulative';
      if (method === 'category-total') return 'dice-category';
      throw new Error(
        `Unknown scoring.method "${method}" for dice game. Expected "cumulative" or "category-total".`
      );
    }
    case 'card':
      return 'card';
    case 'list':
      return 'list';
    default:
      throw new Error(
        `Unknown game.type "${gameType}". Expected "dice", "card", or "list".`
      );
  }
}

const schemaMap = {
  'dice-cumulative': diceCumulativeSchema,
  'dice-category': diceCategorySchema,
  'card': cardGameSchema,
  'list': listGameSchema,
} as const;

/**
 * Get the Zod schema for a given schema key.
 */
export function getSchema(key: SchemaKey) {
  return schemaMap[key];
}

/**
 * Validate a raw parsed TOML object against the appropriate schema.
 * Returns the validated, typed game definition.
 */
export function validateGameDefinition(raw: unknown): GameDefinition {
  const key = resolveSchemaKey(raw);
  const schema = getSchema(key);
  return schema.parse(raw) as GameDefinition;
}

/**
 * Safe version of validateGameDefinition that returns a result object
 * instead of throwing.
 */
export function safeValidateGameDefinition(raw: unknown): {
  success: true;
  data: GameDefinition;
  key: SchemaKey;
} | {
  success: false;
  error: z.ZodError | Error;
  key?: SchemaKey;
} {
  let key: SchemaKey;
  try {
    key = resolveSchemaKey(raw);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
  }

  const schema = getSchema(key);
  const result = schema.safeParse(raw);

  if (result.success) {
    return { success: true, data: result.data as GameDefinition, key };
  }
  return { success: false, error: result.error, key };
}
