import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from './HomePage.js';

function renderHomePage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );
}

describe('HomePage', () => {
  it('renders heading and subtitle', () => {
    renderHomePage();
    expect(screen.getByText('Scorekeep')).toBeInTheDocument();
    expect(screen.getByText('Choose a game to get started.')).toBeInTheDocument();
  });

  it('renders all 4 game cards', () => {
    renderHomePage();
    expect(screen.getByText('Dice 5')).toBeInTheDocument();
    expect(screen.getByText('Yahtzee')).toBeInTheDocument();
    expect(screen.getByText('Golf 4')).toBeInTheDocument();
    expect(screen.getByText('Simple Scores')).toBeInTheDocument();
  });

  it('displays game descriptions', () => {
    renderHomePage();
    expect(screen.getByText('Roll five dice, score points, reach 10,000 to win.')).toBeInTheDocument();
    expect(screen.getByText('Roll 5 dice, fill 13 categories. Highest total wins.')).toBeInTheDocument();
    expect(screen.getByText('Four-card golf. Play 9 holes, most hand wins takes it.')).toBeInTheDocument();
    expect(screen.getByText('Track scores round by round. Highest total wins.')).toBeInTheDocument();
  });

  it('displays type badges with correct labels', () => {
    renderHomePage();
    // Two dice games, one card, one list
    const diceBadges = screen.getAllByText('Dice');
    expect(diceBadges).toHaveLength(2);
    expect(screen.getByText('Card')).toBeInTheDocument();
    expect(screen.getByText('List')).toBeInTheDocument();
  });

  it('renders cards as links to /game/:id', () => {
    renderHomePage();
    const links = screen.getAllByRole('link');
    const hrefs = links.map((link) => link.getAttribute('href'));
    expect(hrefs).toContain('/game/dice-5');
    expect(hrefs).toContain('/game/yahtzee');
    expect(hrefs).toContain('/game/golf-4');
    expect(hrefs).toContain('/game/list-simple');
  });

  it('applies distinct badge colours per type', () => {
    renderHomePage();
    const diceBadge = screen.getAllByText('Dice')[0];
    expect(diceBadge.className).toContain('bg-blue-100');

    const cardBadge = screen.getByText('Card');
    expect(cardBadge.className).toContain('bg-green-100');

    const listBadge = screen.getByText('List');
    expect(listBadge.className).toContain('bg-amber-100');
  });
});
