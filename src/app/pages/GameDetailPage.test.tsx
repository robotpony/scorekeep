import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { GameDetailPage } from './GameDetailPage.js';

function renderGameDetail(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/game/${id}`]}>
      <Routes>
        <Route path="game/:id" element={<GameDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('GameDetailPage', () => {
  it('displays game name and description for dice-5', () => {
    renderGameDetail('dice-5');
    expect(screen.getByText('Dice 5')).toBeInTheDocument();
    expect(screen.getByText('Roll five dice, score points, reach 10,000 to win.')).toBeInTheDocument();
  });

  it('displays player count and equipment', () => {
    renderGameDetail('dice-5');
    expect(screen.getByText('2–8')).toBeInTheDocument();
    expect(screen.getByText('5 6-sided dice')).toBeInTheDocument();
  });

  it('displays rules summary and turn flow', () => {
    renderGameDetail('dice-5');
    expect(screen.getByText(/Roll 5 dice\. Set aside scoring dice/)).toBeInTheDocument();
    expect(screen.getByText('Roll all 5 dice')).toBeInTheDocument();
    expect(screen.getByText('Re-roll remaining dice or bank points')).toBeInTheDocument();
  });

  it('displays key rules as list items', () => {
    renderGameDetail('dice-5');
    expect(screen.getByText(/Must score 1,000\+/)).toBeInTheDocument();
    expect(screen.getByText('First player to 10,000 wins')).toBeInTheDocument();
  });

  it('renders scoring table for cumulative dice game', () => {
    renderGameDetail('dice-5');
    expect(screen.getByText('Single 1')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Single 5')).toBeInTheDocument();
  });

  it('renders scoring table sections for category dice game', () => {
    renderGameDetail('yahtzee');
    expect(screen.getByText('Upper Section')).toBeInTheDocument();
    expect(screen.getByText('Lower Section')).toBeInTheDocument();
    expect(screen.getByText('Ones')).toBeInTheDocument();
    // "Yahtzee" appears as both the page title and a scoring category
    expect(screen.getAllByText('Yahtzee').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/Yahtzee Bonus/)).toBeInTheDocument();
  });

  it('renders scoring table for card game', () => {
    renderGameDetail('golf-4');
    expect(screen.getByText('Card Values')).toBeInTheDocument();
    expect(screen.getByText('Ace')).toBeInTheDocument();
    // "King" appears in both scoring table and key rules
    expect(screen.getAllByText(/King/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Modifiers')).toBeInTheDocument();
    // "Most hand wins" appears in both key rules and scoring note
    expect(screen.getAllByText(/Most hand wins/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders scoring note for list game', () => {
    renderGameDetail('list-simple');
    expect(screen.getByRole('heading', { name: 'Simple Scores' })).toBeInTheDocument();
    expect(screen.getByText('Scores are summed directly.')).toBeInTheDocument();
  });

  it('displays card game equipment', () => {
    renderGameDetail('golf-4');
    expect(screen.getByText('standard 52 deck, 4 cards per player')).toBeInTheDocument();
  });

  it('renders "Play this game" link', () => {
    renderGameDetail('dice-5');
    const playLink = screen.getByText('Play this game');
    expect(playLink.closest('a')).toHaveAttribute('href', '/new?game=dice-5');
  });

  it('shows error state for unknown game ID', () => {
    renderGameDetail('nonexistent');
    expect(screen.getByText('Game not found')).toBeInTheDocument();
    expect(screen.getByText(/nonexistent/)).toBeInTheDocument();
    expect(screen.getByText('Back to games')).toBeInTheDocument();
  });
});
