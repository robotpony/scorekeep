import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '../../../session/context.js';
import { HandWinnerScorecard } from './HandWinnerScorecard.js';
import type { HandWinnerGameSession } from '../../../types/session.js';
import type { CardGameDefinition } from '../../../types/game.js';
import { games } from '../../../definitions/games.js';

const golf4Def = games['golf-4'] as CardGameDefinition;

beforeEach(() => {
  localStorage.clear();
});

function makeSession(overrides: Partial<HandWinnerGameSession> = {}): HandWinnerGameSession {
  return {
    id: 'test-1', game_id: 'golf-4', players: ['Alice', 'Bob'], status: 'active',
    type: 'hand-winner', hand_scores: [[], []], hand_winners: [], hand_win_values: [],
    carryover: 0, current_round: 0, created_at: '', updated_at: '',
    ...overrides,
  };
}

function renderScorecard(session = makeSession()) {
  return render(
    <SessionProvider>
      <MemoryRouter>
        <HandWinnerScorecard session={session} gameDef={golf4Def} />
      </MemoryRouter>
    </SessionProvider>,
  );
}

describe('HandWinnerScorecard', () => {
  it('renders player names in table headers', () => {
    renderScorecard();
    const headers = screen.getAllByRole('columnheader');
    const headerTexts = headers.map(h => h.textContent);
    expect(headerTexts).toContain('Alice');
    expect(headerTexts).toContain('Bob');
  });

  it('shows hand number and total rounds', () => {
    renderScorecard();
    expect(screen.getByText(/Hand 1 of 9/)).toBeInTheDocument();
  });

  it('shows Winner column header', () => {
    renderScorecard();
    const headers = screen.getAllByRole('columnheader');
    expect(headers.map(h => h.textContent)).toContain('Winner');
  });

  it('shows submit hand button', () => {
    renderScorecard();
    expect(screen.getByText('Submit hand')).toBeInTheDocument();
  });

  it('renders score inputs for each player', () => {
    renderScorecard();
    expect(screen.getByLabelText('Alice hand 1 score')).toBeInTheDocument();
    expect(screen.getByLabelText('Bob hand 1 score')).toBeInTheDocument();
  });

  it('shows error when submitting incomplete hand', async () => {
    renderScorecard();
    await userEvent.click(screen.getByText('Submit hand'));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a score for every player');
  });

  it('renders played hands as table rows', () => {
    renderScorecard(makeSession({
      hand_scores: [[3, 7], [8, 4]],
      hand_winners: ['Alice', 'Bob'],
      hand_win_values: [1, 1],
      current_round: 2,
    }));
    const cells = screen.getAllByRole('cell');
    const cellTexts = cells.map(c => c.textContent);
    expect(cellTexts).toContain('3');
    expect(cellTexts).toContain('7');
  });

  it('shows carryover indicator', () => {
    renderScorecard(makeSession({
      carryover: 2,
      current_round: 3,
    }));
    expect(screen.getByText(/\+2 carry/)).toBeInTheDocument();
  });

  it('shows Game Over banner when finished', () => {
    renderScorecard(makeSession({
      hand_scores: [Array(9).fill(3), Array(9).fill(8)],
      hand_winners: Array(9).fill('Alice'),
      hand_win_values: Array(9).fill(1),
      current_round: 9,
      status: 'finished',
      winner: 'Alice',
    }));
    expect(screen.getByText('Game Over')).toBeInTheDocument();
  });
});
