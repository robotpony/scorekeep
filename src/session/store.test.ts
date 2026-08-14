import { describe, it, expect, beforeEach } from 'vitest';
import {
  createSession,
  saveSession,
  loadSession,
  deleteSession,
  listSessions,
  setActiveSessionId,
  getActiveSession,
  getActiveSessionId,
  clearActiveSession,
} from './store.js';

beforeEach(() => {
  localStorage.clear();
});

describe('createSession', () => {
  it('creates a list session', () => {
    const s = createSession('list-simple', ['Alice', 'Bob'], 'list');
    expect(s.type).toBe('list');
    expect(s.game_id).toBe('list-simple');
    expect(s.players).toEqual(['Alice', 'Bob']);
    expect(s.status).toBe('active');
    expect(s.scores).toEqual([[], []]);
  });

  it('creates a cumulative session', () => {
    const s = createSession('dice-5', ['Alice', 'Bob'], 'cumulative');
    expect(s.type).toBe('cumulative');
    expect(s.scores).toEqual([[], []]);
    expect(s.current_player).toBe(0);
    expect(s.pending_score).toBe(0);
  });

  it('creates a category session', () => {
    const s = createSession('yahtzee', ['Alice', 'Bob'], 'category');
    expect(s.type).toBe('category');
    expect(s.category_scores).toEqual([{}, {}]);
    expect(s.yahtzee_bonuses).toEqual([0, 0]);
  });

  it('creates a hand-winner session', () => {
    const s = createSession('golf-4', ['Alice', 'Bob'], 'hand-winner');
    expect(s.type).toBe('hand-winner');
    expect(s.hand_scores).toEqual([[], []]);
    expect(s.hand_winners).toEqual([]);
    expect(s.carryover).toBe(0);
  });

  it('generates unique IDs', () => {
    const s1 = createSession('list-simple', ['A'], 'list');
    const s2 = createSession('list-simple', ['A'], 'list');
    expect(s1.id).not.toBe(s2.id);
  });
});

describe('saveSession / loadSession', () => {
  it('persists and retrieves a session', () => {
    const s = createSession('list-simple', ['Alice', 'Bob'], 'list');
    saveSession(s);
    const loaded = loadSession(s.id);
    expect(loaded).not.toBeNull();
    expect(loaded!.game_id).toBe('list-simple');
    expect(loaded!.players).toEqual(['Alice', 'Bob']);
  });

  it('returns null for unknown ID', () => {
    expect(loadSession('nonexistent')).toBeNull();
  });
});

describe('deleteSession', () => {
  it('removes a session', () => {
    const s = createSession('list-simple', ['Alice'], 'list');
    saveSession(s);
    deleteSession(s.id);
    expect(loadSession(s.id)).toBeNull();
  });

  it('clears active pointer if deleted session was active', () => {
    const s = createSession('list-simple', ['Alice'], 'list');
    saveSession(s);
    setActiveSessionId(s.id);
    deleteSession(s.id);
    expect(getActiveSessionId()).toBeNull();
  });
});

describe('listSessions', () => {
  it('returns empty array when no sessions', () => {
    expect(listSessions()).toEqual([]);
  });

  it('returns all saved sessions sorted by updated_at desc', () => {
    const s1 = createSession('dice-5', ['A'], 'cumulative');
    saveSession(s1);
    // Overwrite with fixed dates directly to test sorting
    const stored1 = { ...JSON.parse(localStorage.getItem(`scorekeep:session:${s1.id}`)!), updated_at: '2024-01-01T00:00:00.000Z' };
    localStorage.setItem(`scorekeep:session:${s1.id}`, JSON.stringify(stored1));

    const s2 = createSession('list-simple', ['B'], 'list');
    saveSession(s2);
    const stored2 = { ...JSON.parse(localStorage.getItem(`scorekeep:session:${s2.id}`)!), updated_at: '2024-01-02T00:00:00.000Z' };
    localStorage.setItem(`scorekeep:session:${s2.id}`, JSON.stringify(stored2));

    const list = listSessions();
    expect(list).toHaveLength(2);
    expect(list[0].id).toBe(s2.id);
    expect(list[1].id).toBe(s1.id);
  });
});

describe('active session', () => {
  it('returns null when no active session', () => {
    expect(getActiveSession()).toBeNull();
    expect(getActiveSessionId()).toBeNull();
  });

  it('sets and retrieves active session', () => {
    const s = createSession('list-simple', ['Alice'], 'list');
    saveSession(s);
    setActiveSessionId(s.id);
    const active = getActiveSession();
    expect(active).not.toBeNull();
    expect(active!.id).toBe(s.id);
  });

  it('clears active session', () => {
    const s = createSession('list-simple', ['Alice'], 'list');
    saveSession(s);
    setActiveSessionId(s.id);
    clearActiveSession();
    expect(getActiveSessionId()).toBeNull();
  });
});
