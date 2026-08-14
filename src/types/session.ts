export interface GameSessionBase {
  id: string;
  game_id: string;
  players: string[];
  status: 'active' | 'finished';
  winner?: string;
  created_at: string;
  updated_at: string;
}

export interface CumulativeGameSession extends GameSessionBase {
  type: 'cumulative';
  scores: number[][];               // scores[playerIndex][roundIndex]
  current_player: number;           // index of player whose turn it is
  pending_score: number;            // accumulated score not yet banked
}

export interface CategoryGameSession extends GameSessionBase {
  type: 'category';
  category_scores: Record<string, number>[]; // per player
  yahtzee_bonuses: number[];
  current_player: number;
}

export interface HandWinnerGameSession extends GameSessionBase {
  type: 'hand-winner';
  hand_scores: number[][];          // hand_scores[playerIndex][roundIndex]
  hand_winners: (string | null)[];  // winner name per round, null = carryover
  hand_win_values: number[];        // value of each round's win (>1 from carryover stacking)
  carryover: number;                // pending carryover count
  current_round: number;
}

export interface ListGameSession extends GameSessionBase {
  type: 'list';
  scores: number[][];               // scores[playerIndex][roundIndex]
}

export type GameSession =
  | CumulativeGameSession
  | CategoryGameSession
  | HandWinnerGameSession
  | ListGameSession;

export type SessionType = GameSession['type'];

export function isCumulativeSession(s: GameSession): s is CumulativeGameSession {
  return s.type === 'cumulative';
}

export function isCategorySession(s: GameSession): s is CategoryGameSession {
  return s.type === 'category';
}

export function isHandWinnerSession(s: GameSession): s is HandWinnerGameSession {
  return s.type === 'hand-winner';
}

export function isListSession(s: GameSession): s is ListGameSession {
  return s.type === 'list';
}
