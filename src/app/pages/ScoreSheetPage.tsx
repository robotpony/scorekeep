import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSession } from '../../session/context.js';
import { games } from '../../definitions/games.js';
import { isDiceGame, isCardGame, isListGame, isCumulativeDice } from '../../types/game.js';
import type { ListGameDefinition, DiceCumulativeGame, DiceCategoryGame, CardGameDefinition } from '../../types/game.js';
import { ListScorecard } from '../components/scorecards/ListScorecard.js';
import { CumulativeScorecard } from '../components/scorecards/CumulativeScorecard.js';
import { CategoryScorecard } from '../components/scorecards/CategoryScorecard.js';
import { HandWinnerScorecard } from '../components/scorecards/HandWinnerScorecard.js';
import { InfoDrawer } from '../components/InfoDrawer.js';
import type { ListGameSession, CumulativeGameSession, CategoryGameSession, HandWinnerGameSession } from '../../types/session.js';

export function ScoreSheetPage() {
  const { activeSession } = useSession();
  const [infoOpen, setInfoOpen] = useState(false);

  if (!activeSession) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="text-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="mx-auto size-12 text-icon-muted">
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <line x1="8" y1="8" x2="16" y2="8" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="8" y1="16" x2="12" y2="16" />
          </svg>
          <h1 className="mt-3 text-lg font-semibold text-heading">No active game</h1>
          <p className="mt-1 text-sm text-muted">
            Start a game to begin tracking scores.
          </p>
          <Link
            to="/new"
            className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            Start a new game
          </Link>
        </div>
      </div>
    );
  }

  const gameDef = games[activeSession.game_id];
  if (!gameDef) {
    return (
      <div className="p-4">
        <h1 className="text-lg font-semibold text-heading">Unknown game</h1>
        <p className="mt-1 text-sm text-muted">Game definition for &ldquo;{activeSession.game_id}&rdquo; not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-heading">{gameDef.game.name}</h1>
        <button
          type="button"
          onClick={() => setInfoOpen(true)}
          className="min-h-11 min-w-11 rounded-lg border border-edge text-faint hover:text-heading hover:border-accent"
          aria-label="Game reference"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-5 mx-auto">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </button>
      </div>
      <div className="mt-4">
        {renderScorecard(activeSession, gameDef)}
      </div>
      <InfoDrawer game={gameDef} open={infoOpen} onClose={() => setInfoOpen(false)} />
    </div>
  );
}

function renderScorecard(session: any, def: any) {
  if (isListGame(def)) {
    return <ListScorecard session={session as ListGameSession} gameDef={def as ListGameDefinition} />;
  }
  if (isDiceGame(def)) {
    if (isCumulativeDice(def)) {
      return <CumulativeScorecard session={session as CumulativeGameSession} gameDef={def as DiceCumulativeGame} />;
    }
    return <CategoryScorecard session={session as CategoryGameSession} gameDef={def as DiceCategoryGame} />;
  }
  if (isCardGame(def)) {
    return <HandWinnerScorecard session={session as HandWinnerGameSession} gameDef={def as CardGameDefinition} />;
  }
  return <p className="text-muted">Unsupported game type.</p>;
}
