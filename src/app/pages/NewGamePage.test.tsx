import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '../../session/context.js';
import { NewGamePage } from './NewGamePage.js';

beforeEach(() => {
  localStorage.clear();
});

function renderPage(initialEntries = ['/new']) {
  return render(
    <SessionProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <NewGamePage />
      </MemoryRouter>
    </SessionProvider>,
  );
}

describe('NewGamePage', () => {
  it('renders heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Start a new game' })).toBeInTheDocument();
  });

  it('lists all 4 games', () => {
    renderPage();
    expect(screen.getByText('Dice 5')).toBeInTheDocument();
    expect(screen.getByText('Yahtzee')).toBeInTheDocument();
    expect(screen.getByText('Golf 4')).toBeInTheDocument();
    expect(screen.getByText('Simple Scores')).toBeInTheDocument();
  });

  it('shows player inputs after selecting a game', async () => {
    renderPage();
    await userEvent.click(screen.getByText('Simple Scores'));
    expect(screen.getByLabelText('Player 1 name')).toBeInTheDocument();
    expect(screen.getByLabelText('Player 2 name')).toBeInTheDocument();
  });

  it('allows adding and removing players', async () => {
    renderPage();
    await userEvent.click(screen.getByText('Simple Scores'));
    // list-simple supports up to 12 players, min 2
    await userEvent.click(screen.getByText('+ Add player'));
    expect(screen.getByLabelText('Player 3 name')).toBeInTheDocument();

    // Remove the third player
    const removeButtons = screen.getAllByLabelText(/Remove player/);
    await userEvent.click(removeButtons[removeButtons.length - 1]);
    expect(screen.queryByLabelText('Player 3 name')).not.toBeInTheDocument();
  });

  it('validates empty player names', async () => {
    renderPage();
    await userEvent.click(screen.getByText('Simple Scores'));
    await userEvent.click(screen.getByText('Start game'));
    expect(screen.getByRole('alert')).toHaveTextContent('All player names are required');
  });

  it('validates duplicate player names', async () => {
    renderPage();
    await userEvent.click(screen.getByText('Simple Scores'));
    const inputs = screen.getAllByRole('textbox');
    await userEvent.type(inputs[0], 'Alice');
    await userEvent.type(inputs[1], 'Alice');
    await userEvent.click(screen.getByText('Start game'));
    expect(screen.getByRole('alert')).toHaveTextContent('Player names must be unique');
  });

  it('disables start button when no game is selected', () => {
    renderPage();
    expect(screen.getByText('Start game')).toBeDisabled();
  });

  it('pre-selects game from URL query param', () => {
    renderPage(['/new?game=dice-5']);
    // Dice 5 should be selected (ring-2 ring-accent class applied)
    const dice5Button = screen.getByText('Dice 5').closest('button');
    expect(dice5Button).toHaveAttribute('aria-checked', 'true');
  });
});
