import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { loadGame } from '../loader/index.js';
import { generateScoringReference } from './index.js';
import type { GameDefinition } from '../types/game.js';

const GAMES_DIR = resolve(import.meta.dirname, '../../games');

function loadDef(filename: string): GameDefinition {
  return loadGame(resolve(GAMES_DIR, filename)).definition;
}

describe('cumulative dice scoring (dice-5)', () => {
  const ref = generateScoringReference(loadDef('dice-5.toml'));

  it('produces a single section with entries', () => {
    expect(ref.sections).toHaveLength(1);
    expect(ref.sections[0].entries.length).toBeGreaterThan(0);
  });

  it('includes singles', () => {
    const labels = ref.sections[0].entries.map((e) => e.label);
    expect(labels).toContain('Single 1');
    expect(labels).toContain('Single 5');
  });

  it('does not include non-scoring singles', () => {
    const labels = ref.sections[0].entries.map((e) => e.label);
    expect(labels).not.toContain('Single 2');
    expect(labels).not.toContain('Single 3');
  });

  it('computes correct single values', () => {
    const entries = ref.sections[0].entries;
    expect(entries.find((e) => e.label === 'Single 1')?.value).toBe('100');
    expect(entries.find((e) => e.label === 'Single 5')?.value).toBe('50');
  });

  it('computes three-of-a-kind with override for 1s', () => {
    const entries = ref.sections[0].entries;
    expect(entries.find((e) => e.label === 'Three 1s')?.value).toBe('1000');
  });

  it('computes three-of-a-kind without override', () => {
    const entries = ref.sections[0].entries;
    expect(entries.find((e) => e.label === 'Three 2s')?.value).toBe('200');
    expect(entries.find((e) => e.label === 'Three 6s')?.value).toBe('600');
  });

  it('computes four-of-a-kind with extra_die_bonus', () => {
    const entries = ref.sections[0].entries;
    // 1s: override 1000 + 50 bonus = 1050
    expect(entries.find((e) => e.label === 'Four 1s')?.value).toBe('1050');
    // 2s: 2*100 + 50 = 250
    expect(entries.find((e) => e.label === 'Four 2s')?.value).toBe('250');
  });

  it('computes five-of-a-kind', () => {
    const entries = ref.sections[0].entries;
    // 1s: override 1000 + 2*50 = 1100
    expect(entries.find((e) => e.label === 'Five 1s')?.value).toBe('1100');
  });

  it('includes entries for all dice counts from min to dice_count', () => {
    const entries = ref.sections[0].entries;
    // Should have entries for three, four, five of each face (1-6)
    // Plus 2 singles = 2 + 6*3 = 20 entries
    expect(entries).toHaveLength(20);
  });
});

describe('category dice scoring (yahtzee)', () => {
  const ref = generateScoringReference(loadDef('yahtzee.toml'));

  it('produces upper section, lower section, and yahtzee bonus', () => {
    expect(ref.sections).toHaveLength(3);
    expect(ref.sections[0].title).toBe('Upper Section');
    expect(ref.sections[1].title).toBe('Lower Section');
  });

  it('upper section has 6 faces plus bonus', () => {
    expect(ref.sections[0].entries).toHaveLength(7); // 6 faces + bonus
    expect(ref.sections[0].entries[0].label).toBe('Ones');
    expect(ref.sections[0].entries[5].label).toBe('Sixes');
    expect(ref.sections[0].entries[6].label).toBe('Bonus');
  });

  it('upper section shows correct ranges', () => {
    expect(ref.sections[0].entries[0].value).toBe('0–5');   // Ones: 0-5
    expect(ref.sections[0].entries[5].value).toBe('0–30');  // Sixes: 0-30
  });

  it('lower section has 7 categories', () => {
    expect(ref.sections[1].entries).toHaveLength(7);
  });

  it('lower section shows fixed scores and ranges', () => {
    const lower = ref.sections[1].entries;
    expect(lower.find((e) => e.label === 'Full House')?.value).toBe('25');
    expect(lower.find((e) => e.label === 'Three of a Kind')?.value).toBe('0–30');
  });

  it('has yahtzee bonus note', () => {
    expect(ref.sections[2].note).toContain('100');
  });
});

describe('card game scoring (golf-4)', () => {
  const ref = generateScoringReference(loadDef('golf-4.toml'));

  it('produces card values, modifiers, and final sections', () => {
    expect(ref.sections).toHaveLength(3);
    expect(ref.sections[0].title).toBe('Card Values');
    expect(ref.sections[1].title).toBe('Modifiers');
  });

  it('card values include face cards and 2-10', () => {
    const values = ref.sections[0].entries;
    expect(values.find((e) => e.label === 'King')?.value).toBe('0');
    expect(values.find((e) => e.label === 'Ace')?.value).toBe('1');
    expect(values.find((e) => e.label === '2–10')?.value).toBe('Face value');
  });

  it('modifiers section shows pair rule', () => {
    const mods = ref.sections[1].entries;
    expect(mods.find((e) => e.label === 'Pair')).toBeDefined();
  });

  it('final note mentions hand wins and bonus', () => {
    expect(ref.sections[2].note).toContain('hand wins');
    expect(ref.sections[2].note).toContain('+2');
  });
});

describe('list game scoring (list-simple)', () => {
  const ref = generateScoringReference(loadDef('list-simple.toml'));

  it('produces a single section with a note', () => {
    expect(ref.sections).toHaveLength(1);
    expect(ref.sections[0].entries).toHaveLength(0);
    expect(ref.sections[0].note).toContain('summed directly');
  });
});
