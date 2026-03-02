import { z } from 'zod';
import { gameMetaSchema, playersSchema, rulesSchema } from './base.js';

const scorecardSchema = z.object({
  layout: z.literal('running-total'),
  entry: z.union([z.literal('accumulator'), z.literal('direct')]),
  commit_label: z.string().optional(),
  zero_label: z.string().optional(),
});

const ofAKindSchema = z.object({
  min: z.number().int().positive(),
  multiplier: z.number().int().positive(),
  extra_die_bonus: z.number().int().nonnegative(),
  overrides: z.record(z.string(), z.number().int().nonnegative()).optional().default({}),
});

const scoringSchema = z.object({
  method: z.literal('cumulative'),
  target: z.number().int().positive(),
  entry_threshold: z.number().int().nonnegative(),
  increment: z.number().int().positive(),
  endgame: z.union([z.literal('immediate'), z.literal('final-round')]),
  singles: z.record(z.string(), z.number().int().nonnegative()),
  of_a_kind: ofAKindSchema,
});

const equipmentSchema = z.object({
  dice_count: z.number().int().positive(),
  dice_sides: z.number().int().positive(),
});

export const diceCumulativeSchema = z.object({
  game: gameMetaSchema.extend({ type: z.literal('dice') }),
  players: playersSchema,
  equipment: equipmentSchema,
  scoring: scoringSchema,
  scorecard: scorecardSchema,
  rules: rulesSchema,
});

export type DiceCumulativeGame = z.infer<typeof diceCumulativeSchema>;
