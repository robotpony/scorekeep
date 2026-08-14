import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '../../../session/context.js';
import { ListScorecard } from './ListScorecard.js';
import type { ListGameSession } from '../../../types/session.js';
import type { ListGameDefinition } from '../../../types/game.js';
import { games } from '../../../definitions/games.js';

const listDef = games['list-simple'] as ListGameDefinition;

beforeEach(() => {
  localStorage.clear();
});

function makeSession(overrides: Partial<ListGameSession> = {}): ListGameSession {
  return {
    id: 'test-1', game_id: 'list-simple', players: ['Alice', 'Bob'], status: 'active',
    type: 'list', scores: [[], []], created_at: '', updated_at: '',
    ...overrides,
  };
}

function renderScorecard(session = makeSession()) {
  return render(
    <SessionProvider>
      <MemoryRouter>
        <ListScorecard session={session} gameDef={listDef} />
      </MemoryRouter>
    </SessionProvider>,
  );
}

describe('ListScorecard', () => {
  it('renders player column headers in the table', () => {
    renderScorecard();
    const headers = screen.getAllByRole('columnheader');
    const headerTexts = headers.map(h => h.textContent);
    expect(headerTexts).toContain('Alice');
    expect(headerTexts).toContain('Bob');
  });

  it('shows Total row', () => {
    renderScorecard();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('renders existing scores in table cells', () => {
    renderScorecard(makeSession({ scores: [[10, 20], [15, 25]] }));
    const cells = screen.getAllByRole('cell');
    const cellTexts = cells.map(c => c.textContent);
    expect(cellTexts).toContain('10');
    expect(cellTexts).toContain('25');
  });

  it('shows running totals in tfoot', () => {
    renderScorecard(makeSession({ scores: [[10, 20], [15, 25]] }));
    // Total row should show 30 and 40
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
  });

  it('shows round input fields', () => {
    renderScorecard();
    expect(screen.getByLabelText('Alice round 1 score')).toBeInTheDocument();
    expect(screen.getByLabelText('Bob round 1 score')).toBeInTheDocument();
  });

  it('shows error when submitting incomplete round', async () => {
    renderScorecard();
    await userEvent.click(screen.getByText('Add round'));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a score for every player');
  });

  it('shows Add round and End game buttons when rounds exist', () => {
    renderScorecard(makeSession({ scores: [[10], [20]] }));
    expect(screen.getByText('Add round')).toBeInTheDocument();
    expect(screen.getByText('End game')).toBeInTheDocument();
  });

  it('does not show End game when no rounds played', () => {
    renderScorecard();
    expect(screen.queryByText('End game')).not.toBeInTheDocument();
  });

  it('shows Game Over banner when finished', () => {
    renderScorecard(makeSession({
      scores: [[10, 20], [15, 25]],
      status: 'finished',
      winner: 'Bob',
    }));
    expect(screen.getByText('Game Over')).toBeInTheDocument();
    expect(screen.getByText(/wins/)).toBeInTheDocument();
    expect(screen.getByText('Play again')).toBeInTheDocument();
  });
});
