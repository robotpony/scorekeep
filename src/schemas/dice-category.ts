import { z } from 'zod';
import { gameMetaSchema, playersSchema, rulesSchema } from './base.js';

const scorecardSchema = z.object({
  layout: z.literal('category-grid'),
  entry: z.literal('category-select'),
});

const upperSchema = z.object({
  faces: z.array(z.number().int().positive()).min(1),
  bonus_threshold: z.number().int().nonnegative(),
  bonus_value: z.number().int().nonnegative(),
});

const lowerCategorySchema = z.object({
  name: z.string().min(1),
  rule: z.string().min(1),
  score: z.number().int().nonnegative().optional(),
  range: z.tuple([z.number().int().nonnegative(), z.number().int().nonnegative()]).optional(),
}).refine((cat) => {
  const hasScore = cat.score !== undefined;
  const hasRange = cat.range !== undefined;
  return hasScore !== hasRange;
}, {
  message: 'Each category must have either "score" or "range", not both or neither',
});

const scoringSchema = z.object({
  method: z.literal('category-total'),
  rounds: z.number().int().positive(),
  rolls_per_turn: z.number().int().positive(),
  winner: z.union([z.literal('highest'), z.literal('lowest')]),
  upper: upperSchema,
  lower: z.array(lowerCategorySchema).min(1),
  yahtzee_bonus: z.object({
    value: z.number().int().nonnegative(),
  }),
});

const equipmentSchema = z.object({
  dice_count: z.number().int().positive(),
  dice_sides: z.number().int().positive(),
});

export const diceCategorySchema = z.object({
  game: gameMetaSchema.extend({ type: z.literal('dice') }),
  players: playersSchema,
  equipment: equipmentSchema,
  scoring: scoringSchema,
  scorecard: scorecardSchema,
  rules: rulesSchema,
});

export type DiceCategoryGame = z.infer<typeof diceCategorySchema>;
