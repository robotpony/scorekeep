import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '../../session/context.js';
import { ScoreSheetPage } from './ScoreSheetPage.js';
import { LeaderboardPage } from './LeaderboardPage.js';

beforeEach(() => {
  localStorage.clear();
});

describe('ScoreSheetPage', () => {
  function renderPage() {
    return render(
      <SessionProvider>
        <MemoryRouter><ScoreSheetPage /></MemoryRouter>
      </SessionProvider>,
    );
  }

  it('renders empty state heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'No active game' })).toBeInTheDocument();
  });

  it('renders descriptive text', () => {
    renderPage();
    expect(screen.getByText('Start a game to begin tracking scores.')).toBeInTheDocument();
  });

  it('links to /new', () => {
    renderPage();
    const link = screen.getByRole('link', { name: 'Start a new game' });
    expect(link).toHaveAttribute('href', '/new');
  });
});

describe('LeaderboardPage', () => {
  function renderPage() {
    return render(<MemoryRouter><LeaderboardPage /></MemoryRouter>);
  }

  it('renders empty state heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'No games played yet' })).toBeInTheDocument();
  });

  it('renders descriptive text', () => {
    renderPage();
    expect(screen.getByText('Play some games and check back for rankings.')).toBeInTheDocument();
  });

  it('links to /new', () => {
    renderPage();
    const link = screen.getByRole('link', { name: 'Start a new game' });
    expect(link).toHaveAttribute('href', '/new');
  });
});
