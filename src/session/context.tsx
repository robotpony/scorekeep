import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import type { GameSession, SessionType } from '../types/session.js';
import type { GameDefinition } from '../types/game.js';
import {
  createSession,
  saveSession,
  getActiveSession,
  setActiveSessionId,
  clearActiveSession,
} from './store.js';

// --- Actions ---

interface CreateAction {
  type: 'CREATE_SESSION';
  gameId: string;
  players: string[];
  sessionType: SessionType;
}

interface RecordScoreAction {
  type: 'RECORD_SCORE';
  payload: Record<string, unknown>;
}

interface UndoAction {
  type: 'UNDO_LAST';
}

interface EndGameAction {
  type: 'END_GAME';
  winner: string;
}

interface LoadAction {
  type: 'LOAD_SESSION';
  session: GameSession | null;
}

interface ClearAction {
  type: 'CLEAR_SESSION';
}

type SessionAction = CreateAction | RecordScoreAction | UndoAction | EndGameAction | LoadAction | ClearAction;

// --- State ---

interface SessionState {
  activeSession: GameSession | null;
  previousSession: GameSession | null; // for undo
}

const initialState: SessionState = {
  activeSession: null,
  previousSession: null,
};

// --- Reducer ---

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'CREATE_SESSION': {
      const session = createSession(action.gameId, action.players, action.sessionType);
      return { activeSession: session, previousSession: null };
    }

    case 'RECORD_SCORE': {
      if (!state.activeSession) return state;
      const updated = applyScore(state.activeSession, action.payload);
      return { activeSession: updated, previousSession: state.activeSession };
    }

    case 'UNDO_LAST': {
      if (!state.previousSession) return state;
      return { activeSession: state.previousSession, previousSession: null };
    }

    case 'END_GAME': {
      if (!state.activeSession) return state;
      return {
        activeSession: {
          ...state.activeSession,
          status: 'finished',
          winner: action.winner,
        },
        previousSession: state.activeSession,
      };
    }

    case 'LOAD_SESSION': {
      return { activeSession: action.session, previousSession: null };
    }

    case 'CLEAR_SESSION': {
      return { activeSession: null, previousSession: null };
    }

    default:
      return state;
  }
}

function applyScore(session: GameSession, payload: Record<string, unknown>): GameSession {
  switch (session.type) {
    case 'list': {
      const { playerIndex, score } = payload as { playerIndex: number; score: number };
      const newScores = session.scores.map((s, i) =>
        i === playerIndex ? [...s, score] : s,
      );
      return { ...session, scores: newScores };
    }

    case 'cumulative': {
      const { playerIndex, score } = payload as { playerIndex: number; score: number };
      const newScores = session.scores.map((s, i) =>
        i === playerIndex ? [...s, score] : s,
      );
      const nextPlayer = (session.current_player + 1) % session.players.length;
      return { ...session, scores: newScores, current_player: nextPlayer, pending_score: 0 };
    }

    case 'category': {
      const { playerIndex, category, score, isYahtzeeBonus } = payload as {
        playerIndex: number; category: string; score: number; isYahtzeeBonus?: boolean;
      };
      const newCategoryScores = session.category_scores.map((cs, i) => {
        if (i !== playerIndex) return cs;
        return { ...cs, [category]: score };
      });
      const newBonuses = isYahtzeeBonus
        ? session.yahtzee_bonuses.map((b, i) => i === playerIndex ? b + 1 : b)
        : [...session.yahtzee_bonuses];
      const nextPlayer = (session.current_player + 1) % session.players.length;
      return { ...session, category_scores: newCategoryScores, yahtzee_bonuses: newBonuses, current_player: nextPlayer };
    }

    case 'hand-winner': {
      const { scores: roundScores, winner, winValue } = payload as {
        scores: number[]; winner: string | null; winValue: number;
      };
      const newHandScores = session.hand_scores.map((s, i) => [...s, roundScores[i]]);
      const newCarryover = winner === null ? session.carryover + 1 : 0;
      const actualWinValue = winner !== null ? winValue + session.carryover : 0;
      return {
        ...session,
        hand_scores: newHandScores,
        hand_winners: [...session.hand_winners, winner],
        hand_win_values: [...session.hand_win_values, actualWinValue],
        carryover: newCarryover,
        current_round: session.current_round + 1,
      };
    }

    default:
      return session;
  }
}

// --- Context ---

interface SessionContextValue {
  activeSession: GameSession | null;
  canUndo: boolean;
  dispatch: React.Dispatch<SessionAction>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  // Load active session on mount
  useEffect(() => {
    const session = getActiveSession();
    if (session) {
      dispatch({ type: 'LOAD_SESSION', session });
    }
  }, []);

  // Auto-save to localStorage on session change
  useEffect(() => {
    if (state.activeSession) {
      saveSession(state.activeSession);
      setActiveSessionId(state.activeSession.id);
    }
  }, [state.activeSession]);

  return (
    <SessionContext.Provider value={{
      activeSession: state.activeSession,
      canUndo: state.previousSession !== null,
      dispatch,
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}

export type { SessionAction, SessionState };
