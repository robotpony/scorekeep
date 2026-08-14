import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../../../session/context.js';
import { sessionTypeForGame } from '../../../session/helpers.js';
import type { GameDefinition } from '../../../types/game.js';

interface GameOverBannerProps {
  winner: string;
  totals: number[];
  players: string[];
  gameDef: GameDefinition;
}

export function GameOverBanner({ winner, totals, players, gameDef }: GameOverBannerProps) {
  const { dispatch } = useSession();
  const navigate = useNavigate();

  function playAgain() {
    const sessionType = sessionTypeForGame(gameDef);
    dispatch({ type: 'CREATE_SESSION', gameId: gameDef.game.id, players, sessionType });
  }

  return (
    <div className="rounded-lg border border-accent bg-surface p-4 text-center">
      <h2 className="text-lg font-bold text-heading">Game Over</h2>
      <p className="mt-1 text-body">
        <span className="font-semibold text-accent-text">{winner}</span> wins!
      </p>

      <div className="mt-3 flex justify-center gap-4 text-sm">
        {players.map((name, i) => (
          <div key={name} className={name === winner ? 'font-bold text-accent-text' : 'text-body'}>
            {name}: {totals[i]}
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-3">
        <button
          type="button"
          onClick={playAgain}
          className="min-h-11 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Play again
        </button>
        <Link
          to="/"
          className="min-h-11 inline-flex items-center rounded-lg border border-edge px-4 py-2 text-sm font-medium text-body hover:bg-surface"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
