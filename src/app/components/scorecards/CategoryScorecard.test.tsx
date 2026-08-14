import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '../../../session/context.js';
import { CategoryScorecard } from './CategoryScorecard.js';
import type { CategoryGameSession } from '../../../types/session.js';
import type { DiceCategoryGame } from '../../../types/game.js';
import { games } from '../../../definitions/games.js';

const yahtzeeDef = games['yahtzee'] as DiceCategoryGame;

beforeEach(() => {
  localStorage.clear();
});

function makeSession(overrides: Partial<CategoryGameSession> = {}): CategoryGameSession {
  return {
    id: 'test-1', game_id: 'yahtzee', players: ['Alice', 'Bob'], status: 'active',
    type: 'category', category_scores: [{}, {}], yahtzee_bonuses: [0, 0], current_player: 0,
    created_at: '', updated_at: '',
    ...overrides,
  };
}

function renderScorecard(session = makeSession()) {
  return render(
    <SessionProvider>
      <MemoryRouter>
        <CategoryScorecard session={session} gameDef={yahtzeeDef} />
      </MemoryRouter>
    </SessionProvider>,
  );
}

describe('CategoryScorecard', () => {
  it('renders all upper section categories', () => {
    renderScorecard();
    expect(screen.getByText('Ones')).toBeInTheDocument();
    expect(screen.getByText('Twos')).toBeInTheDocument();
    expect(screen.getByText('Threes')).toBeInTheDocument();
    expect(screen.getByText('Fours')).toBeInTheDocument();
    expect(screen.getByText('Fives')).toBeInTheDocument();
    expect(screen.getByText('Sixes')).toBeInTheDocument();
  });

  it('renders all lower section categories', () => {
    renderScorecard();
    expect(screen.getByText('Three of a Kind')).toBeInTheDocument();
    expect(screen.getByText('Four of a Kind')).toBeInTheDocument();
    expect(screen.getByText('Full House')).toBeInTheDocument();
    expect(screen.getByText('Small Straight')).toBeInTheDocument();
    expect(screen.getByText('Large Straight')).toBeInTheDocument();
    expect(screen.getByText('Chance')).toBeInTheDocument();
  });

  it('shows current player turn', () => {
    renderScorecard();
    expect(screen.getByText(/Alice's turn/)).toBeInTheDocument();
  });

  it('shows instruction to tap a category', () => {
    renderScorecard();
    expect(screen.getByText(/Tap a category/)).toBeInTheDocument();
  });

  it('renders player names in table headers', () => {
    renderScorecard();
    const headers = screen.getAllByRole('columnheader');
    const headerTexts = headers.map(h => h.textContent);
    expect(headerTexts).toContain('Alice');
    expect(headerTexts).toContain('Bob');
  });

  it('shows upper subtotal and bonus row', () => {
    renderScorecard();
    expect(screen.getByText('Upper subtotal')).toBeInTheDocument();
    expect(screen.getByText('Bonus')).toBeInTheDocument();
  });

  it('shows filled category scores', () => {
    renderScorecard(makeSession({
      category_scores: [{ Ones: 3, Twos: 8 }, {}],
    }));
    const cells = screen.getAllByRole('cell');
    const cellTexts = cells.map(c => c.textContent);
    // Should contain the filled scores
    expect(cellTexts).toContain('3');
    expect(cellTexts).toContain('8');
  });

  it('shows total row', () => {
    renderScorecard(makeSession({
      category_scores: [{ Ones: 3, Twos: 8 }, { Ones: 2 }],
    }));
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('shows Game Over banner when finished', () => {
    renderScorecard(makeSession({
      status: 'finished',
      winner: 'Alice',
      category_scores: [{ Ones: 3 }, { Ones: 1 }],
    }));
    expect(screen.getByText('Game Over')).toBeInTheDocument();
  });
});
