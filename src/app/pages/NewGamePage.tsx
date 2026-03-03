import { gameList } from '../../definitions/games.js';
import { getBadge } from '../components/badges.js';

export function NewGamePage() {
  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="text-2xl font-bold text-heading">Start a new game</h1>
      <p className="mt-1 text-muted">
        Pick a game, then set up players.
      </p>

      <ul className="mt-4 space-y-2">
        {gameList.map((def) => {
          const badge = getBadge(def.game.type);
          return (
            <li
              key={def.game.id}
              className="flex items-center justify-between rounded-lg border border-edge bg-surface p-3"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-heading">{def.game.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
                  {badge.label}
                </span>
              </div>
              <button
                disabled
                className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white opacity-50 cursor-not-allowed"
              >
                Play
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-center text-sm text-faint">
        Player setup coming soon.
      </p>
    </div>
  );
}
