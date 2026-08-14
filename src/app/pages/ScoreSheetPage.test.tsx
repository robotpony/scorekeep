import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '../../session/context.js';
import { ScoreSheetPage } from './ScoreSheetPage.js';

beforeEach(() => {
  localStorage.clear();
});

function renderPage() {
  return render(
    <SessionProvider>
      <MemoryRouter>
        <ScoreSheetPage />
      </MemoryRouter>
    </SessionProvider>,
  );
}

describe('ScoreSheetPage', () => {
  it('renders empty state when no active session', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'No active game' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Start a new game' })).toHaveAttribute('href', '/new');
  });

  it('renders game title when session exists', () => {
    // Pre-populate localStorage with an active session
    const session = {
      id: 'test-1', game_id: 'list-simple', players: ['A', 'B'], status: 'active',
      type: 'list', scores: [[], []], created_at: '', updated_at: '',
    };
    localStorage.setItem('scorekeep:session:test-1', JSON.stringify(session));
    localStorage.setItem('scorekeep:active', 'test-1');

    renderPage();
    expect(screen.getByText('Simple Scores')).toBeInTheDocument();
  });
});
