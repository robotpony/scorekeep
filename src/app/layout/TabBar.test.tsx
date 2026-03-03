import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './AppShell.js';
import { HomePage } from '../pages/HomePage.js';
import { NewGamePage } from '../pages/NewGamePage.js';
import { ScoreSheetPage } from '../pages/ScoreSheetPage.js';
import { LeaderboardPage } from '../pages/LeaderboardPage.js';
import { GameDetailPage } from '../pages/GameDetailPage.js';

function renderWithRouter(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="new" element={<NewGamePage />} />
          <Route path="score" element={<ScoreSheetPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="game/:id" element={<GameDetailPage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('TabBar', () => {
  it('renders all 4 tab labels', () => {
    renderWithRouter();
    // Two instances of each label (mobile + desktop tab bars)
    expect(screen.getAllByText('Home')).toHaveLength(2);
    expect(screen.getAllByText('New Game')).toHaveLength(2);
    expect(screen.getAllByText('Score Sheet')).toHaveLength(2);
    expect(screen.getAllByText('Leaderboard')).toHaveLength(2);
  });

  it('renders navigation landmarks', () => {
    renderWithRouter();
    const navs = screen.getAllByRole('navigation', { name: 'Main navigation' });
    expect(navs.length).toBe(2); // mobile + desktop
  });

  it('highlights Home tab on / route', () => {
    renderWithRouter('/');
    const homeLinks = screen.getAllByText('Home').map((el) => el.closest('a')!);
    // At least one should have the active class
    expect(homeLinks.some((link) => link.className.includes('text-indigo-600'))).toBe(true);
  });

  it('highlights New Game tab on /new route', () => {
    renderWithRouter('/new');
    const links = screen.getAllByText('New Game').map((el) => el.closest('a')!);
    expect(links.some((link) => link.className.includes('text-indigo-600'))).toBe(true);
  });

  it('highlights Score Sheet tab on /score route', () => {
    renderWithRouter('/score');
    const links = screen.getAllByText('Score Sheet').map((el) => el.closest('a')!);
    expect(links.some((link) => link.className.includes('text-indigo-600'))).toBe(true);
  });

  it('highlights Leaderboard tab on /leaderboard route', () => {
    renderWithRouter('/leaderboard');
    const links = screen.getAllByText('Leaderboard').map((el) => el.closest('a')!);
    expect(links.some((link) => link.className.includes('text-indigo-600'))).toBe(true);
  });

  it('does not highlight Home tab on other routes', () => {
    renderWithRouter('/new');
    const homeLinks = screen.getAllByText('Home').map((el) => el.closest('a')!);
    expect(homeLinks.every((link) => !link.className.includes('text-indigo-600'))).toBe(true);
  });

  it('navigates between tabs on click', async () => {
    const user = userEvent.setup();
    renderWithRouter('/');

    // Verify we start on home
    expect(screen.getByText('Choose a game to get started.')).toBeInTheDocument();

    // Click New Game tab
    const newGameLinks = screen.getAllByText('New Game');
    await user.click(newGameLinks[0]);
    expect(screen.getByText('Start a new game.')).toBeInTheDocument();

    // Click Score Sheet tab
    const scoreLinks = screen.getAllByText('Score Sheet');
    await user.click(scoreLinks[0]);
    expect(screen.getByText('No active game.')).toBeInTheDocument();

    // Click Leaderboard tab
    const lbLinks = screen.getAllByText('Leaderboard');
    await user.click(lbLinks[0]);
    expect(screen.getByText('No games played yet.')).toBeInTheDocument();

    // Click Home tab to go back
    const homeLinks = screen.getAllByText('Home');
    await user.click(homeLinks[0]);
    expect(screen.getByText('Choose a game to get started.')).toBeInTheDocument();
  });
});

describe('AppShell', () => {
  it('renders page content inside main element', () => {
    renderWithRouter('/');
    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveTextContent('Scorekeep');
  });

  it('renders game detail page for /game/:id', () => {
    renderWithRouter('/game/dice-5');
    expect(screen.getByText('Dice 5')).toBeInTheDocument();
  });
});
