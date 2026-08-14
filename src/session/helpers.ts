import type { GameDefinition } from '../types/game.js';
import type { SessionType } from '../types/session.js';
import { isDiceGame, isCumulativeDice } from '../types/game.js';

export function sessionTypeForGame(def: GameDefinition): SessionType {
  if (isDiceGame(def)) {
    return isCumulativeDice(def) ? 'cumulative' : 'category';
  }
  if (def.game.type === 'card') return 'hand-winner';
  return 'list';
}
