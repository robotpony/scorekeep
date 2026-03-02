import type { GameDefinition, DiceCumulativeGame, DiceCategoryGame, CardGameDefinition } from '../types/game.js';
import { isDiceGame, isCardGame, isListGame, isCumulativeDice } from '../types/game.js';

export interface ScoringEntry {
  label: string;
  value: string;
}

export interface ScoringSection {
  title?: string;
  entries: ScoringEntry[];
  note?: string;
}

export interface ScoringReference {
  sections: ScoringSection[];
}

/**
 * Generate a scoring reference for any game definition.
 */
export function generateScoringReference(def: GameDefinition): ScoringReference {
  if (isDiceGame(def)) {
    return isCumulativeDice(def)
      ? cumulativeDiceScoring(def)
      : categoryDiceScoring(def);
  }
  if (isCardGame(def)) {
    return cardGameScoring(def);
  }
  if (isListGame(def)) {
    return { sections: [{ entries: [], note: 'Scores are summed directly.' }] };
  }
  return { sections: [] };
}

// --- Cumulative dice (dice-5) ---

const COUNT_NAMES: Record<number, string> = {
  1: 'Single', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six',
};

function countName(n: number): string {
  return COUNT_NAMES[n] ?? `${n}×`;
}

function facePlural(face: number, count: number): string {
  if (count === 1) return `${face}`;
  return `${face}s`;
}

function cumulativeDiceScoring(def: DiceCumulativeGame): ScoringReference {
  const { singles, of_a_kind } = def.scoring;
  const { dice_count, dice_sides } = def.equipment;
  const entries: ScoringEntry[] = [];

  // Singles
  for (let face = 1; face <= dice_sides; face++) {
    const key = String(face);
    if (key in singles) {
      entries.push({
        label: `Single ${face}`,
        value: String(singles[key]),
      });
    }
  }

  // Of-a-kind combos, grouped by count
  for (let n = of_a_kind.min; n <= dice_count; n++) {
    for (let face = 1; face <= dice_sides; face++) {
      const key = String(face);
      const base = key in (of_a_kind.overrides ?? {})
        ? of_a_kind.overrides[key]
        : face * of_a_kind.multiplier;
      const bonus = (n - of_a_kind.min) * of_a_kind.extra_die_bonus;
      const total = base + bonus;
      entries.push({
        label: `${countName(n)} ${facePlural(face, n)}`,
        value: String(total),
      });
    }
  }

  return { sections: [{ entries }] };
}

// --- Category dice (Yahtzee) ---

const FACE_NAMES: Record<number, string> = {
  1: 'Ones', 2: 'Twos', 3: 'Threes', 4: 'Fours', 5: 'Fives', 6: 'Sixes',
};

function categoryDiceScoring(def: DiceCategoryGame): ScoringReference {
  const { upper, lower, yahtzee_bonus } = def.scoring;
  const { dice_count } = def.equipment;
  const sections: ScoringSection[] = [];

  // Upper section
  const upperEntries: ScoringEntry[] = upper.faces.map((face) => ({
    label: FACE_NAMES[face] ?? `${face}s`,
    value: `0–${face * dice_count}`,
  }));
  upperEntries.push({
    label: 'Bonus',
    value: `${upper.bonus_value} (if ≥${upper.bonus_threshold})`,
  });
  sections.push({ title: 'Upper Section', entries: upperEntries });

  // Lower section
  const lowerEntries: ScoringEntry[] = lower.map((cat) => ({
    label: cat.name,
    value: cat.score !== undefined ? String(cat.score) : `${cat.range![0]}–${cat.range![1]}`,
  }));
  sections.push({ title: 'Lower Section', entries: lowerEntries });

  // Yahtzee bonus note
  if (yahtzee_bonus.value > 0) {
    sections.push({
      entries: [],
      note: `Yahtzee Bonus: +${yahtzee_bonus.value} per additional Yahtzee`,
    });
  }

  return { sections };
}

// --- Card games (golf-4) ---

function cardGameScoring(def: CardGameDefinition): ScoringReference {
  const { card_values, modifiers, final } = def.scoring;
  const sections: ScoringSection[] = [];

  // Card values
  const valueEntries: ScoringEntry[] = Object.entries(card_values).map(([card, value]) => ({
    label: card.charAt(0).toUpperCase() + card.slice(1),
    value: String(value),
  }));
  valueEntries.push({ label: '2–10', value: 'Face value' });
  sections.push({ title: 'Card Values', entries: valueEntries });

  // Modifiers
  if (Object.keys(modifiers).length > 0) {
    const modEntries: ScoringEntry[] = Object.entries(modifiers).map(([mod, value]) => ({
      label: mod.charAt(0).toUpperCase() + mod.slice(1),
      value: `Both score ${value}`,
    }));
    sections.push({ title: 'Modifiers', entries: modEntries });
  }

  // Final scoring
  sections.push({
    entries: [],
    note: `Final: Most ${final.metric.replace('-', ' ')}${final.lowest_cumulative_bonus > 0 ? ` (+${final.lowest_cumulative_bonus} for lowest cumulative)` : ''} wins`,
  });

  return { sections };
}
