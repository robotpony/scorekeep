import { gameList } from '../../definitions/games.js';

const typeBadge: Record<string, { label: string; className: string }> = {
  dice: {
    label: 'Dice',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  card: {
    label: 'Card',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  list: {
    label: 'List',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  },
};

export function NewGamePage() {
  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Start a new game</h1>
      <p className="mt-1 text-gray-600 dark:text-gray-400">
        Pick a game, then set up players.
      </p>

      <ul className="mt-4 space-y-2">
        {gameList.map((def) => {
          const badge = typeBadge[def.game.type] ?? { label: def.game.type, className: 'bg-gray-100 text-gray-800' };
          return (
            <li
              key={def.game.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-gray-100">{def.game.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
                  {badge.label}
                </span>
              </div>
              <button
                disabled
                className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white opacity-50 cursor-not-allowed"
              >
                Play
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Player setup coming soon.
      </p>
    </div>
  );
}
