import { z } from 'zod';
import { gameMetaSchema, playersSchema, rulesSchema } from './base.js';

const scorecardSchema = z.object({
  layout: z.literal('golf-card'),
  entry: z.literal('direct'),
  mark_winner: z.boolean(),
});

const handSchema = z.object({
  winner: z.union([z.literal('lowest'), z.literal('highest')]),
  tie: z.union([z.literal('carryover'), z.literal('split'), z.literal('none')]),
});

const finalSchema = z.object({
  metric: z.literal('hand-wins'),
  lowest_cumulative_bonus: z.number().int().nonnegative(),
  winner: z.union([z.literal('highest'), z.literal('lowest')]),
});

const scoringSchema = z.object({
  rounds: z.number().int().positive(),
  hand: handSchema,
  card_values: z.record(z.string(), z.number().int()),
  modifiers: z.record(z.string(), z.number().int()),
  final: finalSchema,
});

const equipmentSchema = z.object({
  deck: z.string().min(1),
  cards_per_player: z.number().int().positive(),
});

export const cardGameSchema = z.object({
  game: gameMetaSchema.extend({ type: z.literal('card') }),
  players: playersSchema,
  equipment: equipmentSchema,
  scoring: scoringSchema,
  scorecard: scorecardSchema,
  rules: rulesSchema,
});

export type CardGameDefinition = z.infer<typeof cardGameSchema>;
