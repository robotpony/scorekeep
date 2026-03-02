import { z } from 'zod';
import { gameMetaSchema, playersSchema, rulesSchema } from './base.js';

const scorecardSchema = z.object({
  layout: z.union([z.literal('list-vertical'), z.literal('list-horizontal')]),
  entry: z.literal('direct'),
});

const scoringSchema = z.object({
  winner: z.union([z.literal('highest'), z.literal('lowest')]),
});

export const listGameSchema = z.object({
  game: gameMetaSchema.extend({ type: z.literal('list') }),
  players: playersSchema,
  scoring: scoringSchema,
  scorecard: scorecardSchema,
  rules: rulesSchema.optional(),
});

export type ListGameDefinition = z.infer<typeof listGameSchema>;
