import { z } from 'zod';

export const gameMetaSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  description: z.string().min(1),
});

export const playersSchema = z.object({
  min: z.number().int().positive(),
  max: z.number().int().positive(),
}).refine((p) => p.max >= p.min, {
  message: 'max must be >= min',
  path: ['max'],
});

export const rulesSchema = z.object({
  turn_order: z.string().min(1),
  summary: z.string().min(1),
  turn_flow: z.array(z.string().min(1)).min(1),
  key_rules: z.array(z.string().min(1)).min(1),
});

export const baseScorecardSchema = z.object({
  layout: z.string().min(1),
  entry: z.string().min(1),
});
