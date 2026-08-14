import type {
  GameSession,
  CumulativeGameSession,
  CategoryGameSession,
  HandWinnerGameSession,
  ListGameSession,
  SessionType,
} from '../types/session.js';

const SESSION_PREFIX = 'scorekeep:session:';
const ACTIVE_KEY = 'scorekeep:active';

let idCounter = 0;

function generateId(): string {
  return `${Date.now()}-${++idCounter}`;
}

function now(): string {
  return new Date().toISOString();
}

export function createSession(
  gameId: string,
  players: string[],
  type: SessionType,
): GameSession {
  const base = {
    id: generateId(),
    game_id: gameId,
    players,
    status: 'active' as const,
    created_at: now(),
    updated_at: now(),
  };

  switch (type) {
    case 'cumulative':
      return {
        ...base,
        type: 'cumulative',
        scores: players.map(() => []),
        current_player: 0,
        pending_score: 0,
      } satisfies CumulativeGameSession;

    case 'category':
      return {
        ...base,
        type: 'category',
        category_scores: players.map(() => ({})),
        yahtzee_bonuses: players.map(() => 0),
        current_player: 0,
      } satisfies CategoryGameSession;

    case 'hand-winner':
      return {
        ...base,
        type: 'hand-winner',
        hand_scores: players.map(() => []),
        hand_winners: [],
        hand_win_values: [],
        carryover: 0,
        current_round: 0,
      } satisfies HandWinnerGameSession;

    case 'list':
      return {
        ...base,
        type: 'list',
        scores: players.map(() => []),
      } satisfies ListGameSession;
  }
}

export function saveSession(session: GameSession): void {
  session.updated_at = now();
  localStorage.setItem(SESSION_PREFIX + session.id, JSON.stringify(session));
}

export function loadSession(id: string): GameSession | null {
  const raw = localStorage.getItem(SESSION_PREFIX + id);
  if (!raw) return null;
  return JSON.parse(raw) as GameSession;
}

export function deleteSession(id: string): void {
  localStorage.removeItem(SESSION_PREFIX + id);
  const activeId = localStorage.getItem(ACTIVE_KEY);
  if (activeId === id) {
    localStorage.removeItem(ACTIVE_KEY);
  }
}

export function listSessions(): GameSession[] {
  const sessions: GameSession[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(SESSION_PREFIX)) {
      const raw = localStorage.getItem(key);
      if (raw) {
        sessions.push(JSON.parse(raw) as GameSession);
      }
    }
  }
  return sessions.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export function setActiveSessionId(id: string): void {
  localStorage.setItem(ACTIVE_KEY, id);
}

export function getActiveSessionId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export function getActiveSession(): GameSession | null {
  const id = getActiveSessionId();
  if (!id) return null;
  return loadSession(id);
}

export function clearActiveSession(): void {
  localStorage.removeItem(ACTIVE_KEY);
}
