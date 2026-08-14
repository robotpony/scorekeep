import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '../../../session/context.js';
import { CumulativeScorecard } from './CumulativeScorecard.js';
import type { CumulativeGameSession } from '../../../types/session.js';
import type { DiceCumulativeGame } from '../../../types/game.js';
import { games } from '../../../definitions/games.js';

const dice5Def = games['dice-5'] as DiceCumulativeGame;

beforeEach(() => {
  localStorage.clear();
});

function makeSession(overrides: Partial<CumulativeGameSession> = {}): CumulativeGameSession {
  return {
    id: 'test-1', game_id: 'dice-5', players: ['Alice', 'Bob'], status: 'active',
    type: 'cumulative', scores: [[], []], current_player: 0, pending_score: 0,
    created_at: '', updated_at: '',
    ...overrides,
  };
}

function renderScorecard(session = makeSession()) {
  return render(
    <SessionProvider>
      <MemoryRouter>
        <CumulativeScorecard session={session} gameDef={dice5Def} />
      </MemoryRouter>
    </SessionProvider>,
  );
}

describe('CumulativeScorecard', () => {
  it('renders player names in the table', () => {
    renderScorecard();
    const headers = screen.getAllByRole('columnheader');
    const headerTexts = headers.map(h => h.textContent);
    expect(headerTexts).toContain('Alice');
    expect(headerTexts).toContain('Bob');
  });

  it('shows current player turn indicator', () => {
    renderScorecard();
    expect(screen.getByText(/Alice's turn/)).toBeInTheDocument();
  });

  it('renders Bank and Farkle buttons', () => {
    renderScorecard();
    expect(screen.getByText('Bank')).toBeInTheDocument();
    expect(screen.getByText('Farkle')).toBeInTheDocument();
  });

  it('shows quick-add buttons derived from scoring rules', () => {
    renderScorecard();
    expect(screen.getByText('+100')).toBeInTheDocument();
    expect(screen.getByText('+50')).toBeInTheDocument();
  });

  it('shows target info', () => {
    renderScorecard();
    expect(screen.getByText(/Target: 10,000/)).toBeInTheDocument();
  });

  it('shows entry threshold hint when no one is on the board', () => {
    renderScorecard();
    expect(screen.getByText(/First score must be 1,000/)).toBeInTheDocument();
  });

  it('renders existing scores as table cells', () => {
    renderScorecard(makeSession({ scores: [[1000, 500], [1500]] }));
    const cells = screen.getAllByRole('cell');
    const cellTexts = cells.map(c => c.textContent);
    expect(cellTexts).toContain('+1000');
    expect(cellTexts).toContain('+500');
    expect(cellTexts).toContain('+1500');
  });

  it('shows direct entry input', () => {
    renderScorecard();
    expect(screen.getByLabelText('Direct score entry')).toBeInTheDocument();
  });

  it('shows Game Over banner when finished', () => {
    renderScorecard(makeSession({
      scores: [[5000, 5500], [4000, 3000]],
      status: 'finished',
      winner: 'Alice',
    }));
    expect(screen.getByText('Game Over')).toBeInTheDocument();
    expect(screen.getByText(/wins/)).toBeInTheDocument();
  });
});
