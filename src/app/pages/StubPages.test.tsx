import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NewGamePage } from './NewGamePage.js';
import { ScoreSheetPage } from './ScoreSheetPage.js';
import { LeaderboardPage } from './LeaderboardPage.js';

describe('NewGamePage', () => {
  function renderPage() {
    return render(<MemoryRouter><NewGamePage /></MemoryRouter>);
  }

  it('renders heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Start a new game' })).toBeInTheDocument();
  });

  it('lists all 4 games with names', () => {
    renderPage();
    expect(screen.getByText('Dice 5')).toBeInTheDocument();
    expect(screen.getByText('Yahtzee')).toBeInTheDocument();
    expect(screen.getByText('Golf 4')).toBeInTheDocument();
    expect(screen.getByText('Simple Scores')).toBeInTheDocument();
  });

  it('shows disabled Play buttons', () => {
    renderPage();
    const buttons = screen.getAllByRole('button', { name: 'Play' });
    expect(buttons).toHaveLength(4);
    buttons.forEach((btn) => expect(btn).toBeDisabled());
  });

  it('shows "Player setup coming soon" note', () => {
    renderPage();
    expect(screen.getByText('Player setup coming soon.')).toBeInTheDocument();
  });
});

describe('ScoreSheetPage', () => {
  function renderPage() {
    return render(<MemoryRouter><ScoreSheetPage /></MemoryRouter>);
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
