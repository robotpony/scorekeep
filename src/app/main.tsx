import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './layout/AppShell.js';
import { HomePage } from './pages/HomePage.js';
import { NewGamePage } from './pages/NewGamePage.js';
import { ScoreSheetPage } from './pages/ScoreSheetPage.js';
import { LeaderboardPage } from './pages/LeaderboardPage.js';
import { GameDetailPage } from './pages/GameDetailPage.js';
import './app.css';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="new" element={<NewGamePage />} />
          <Route path="score" element={<ScoreSheetPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="game/:id" element={<GameDetailPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
