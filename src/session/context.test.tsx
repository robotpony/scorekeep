import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { SessionProvider, useSession } from './context.js';

beforeEach(() => {
  localStorage.clear();
});

function TestConsumer() {
  const { activeSession, canUndo, dispatch } = useSession();
  return (
    <div>
      <span data-testid="status">{activeSession ? activeSession.status : 'none'}</span>
      <span data-testid="type">{activeSession?.type ?? 'none'}</span>
      <span data-testid="players">{activeSession?.players.join(',') ?? 'none'}</span>
      <span data-testid="canUndo">{String(canUndo)}</span>
      <button onClick={() => dispatch({ type: 'CREATE_SESSION', gameId: 'list-simple', players: ['A', 'B'], sessionType: 'list' })}>
        Create List
      </button>
      <button onClick={() => dispatch({ type: 'CREATE_SESSION', gameId: 'dice-5', players: ['A', 'B'], sessionType: 'cumulative' })}>
        Create Cumulative
      </button>
      <button onClick={() => dispatch({ type: 'RECORD_SCORE', payload: { playerIndex: 0, score: 10 } })}>
        Score 10
      </button>
      <button onClick={() => dispatch({ type: 'UNDO_LAST' })}>
        Undo
      </button>
      <button onClick={() => dispatch({ type: 'END_GAME', winner: 'A' })}>
        End Game
      </button>
      <button onClick={() => dispatch({ type: 'CLEAR_SESSION' })}>
        Clear
      </button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <SessionProvider>
      <TestConsumer />
    </SessionProvider>,
  );
}

describe('SessionProvider', () => {
  it('starts with no active session', () => {
    renderWithProvider();
    expect(screen.getByTestId('status').textContent).toBe('none');
  });

  it('creates a list session', async () => {
    renderWithProvider();
    await act(async () => {
      screen.getByText('Create List').click();
    });
    expect(screen.getByTestId('status').textContent).toBe('active');
    expect(screen.getByTestId('type').textContent).toBe('list');
    expect(screen.getByTestId('players').textContent).toBe('A,B');
  });

  it('records a score for list session', async () => {
    renderWithProvider();
    await act(async () => {
      screen.getByText('Create List').click();
    });
    await act(async () => {
      screen.getByText('Score 10').click();
    });
    expect(screen.getByTestId('canUndo').textContent).toBe('true');
  });

  it('undoes last action', async () => {
    renderWithProvider();
    await act(async () => {
      screen.getByText('Create List').click();
    });
    await act(async () => {
      screen.getByText('Score 10').click();
    });
    expect(screen.getByTestId('canUndo').textContent).toBe('true');
    await act(async () => {
      screen.getByText('Undo').click();
    });
    expect(screen.getByTestId('canUndo').textContent).toBe('false');
  });

  it('ends a game', async () => {
    renderWithProvider();
    await act(async () => {
      screen.getByText('Create List').click();
    });
    await act(async () => {
      screen.getByText('End Game').click();
    });
    expect(screen.getByTestId('status').textContent).toBe('finished');
  });

  it('clears session', async () => {
    renderWithProvider();
    await act(async () => {
      screen.getByText('Create List').click();
    });
    await act(async () => {
      screen.getByText('Clear').click();
    });
    expect(screen.getByTestId('status').textContent).toBe('none');
  });

  it('persists session to localStorage', async () => {
    renderWithProvider();
    await act(async () => {
      screen.getByText('Create List').click();
    });
    // Check that something was written to localStorage
    const keys = Object.keys(localStorage).filter(k => k.startsWith('scorekeep:session:'));
    expect(keys.length).toBeGreaterThan(0);
  });
});
