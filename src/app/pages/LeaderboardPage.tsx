import { Link } from 'react-router-dom';

export function LeaderboardPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="text-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="mx-auto size-12 text-gray-400 dark:text-gray-500">
          <rect x="4" y="14" width="4" height="7" />
          <rect x="10" y="8" width="4" height="13" />
          <rect x="16" y="11" width="4" height="10" />
        </svg>
        <h1 className="mt-3 text-lg font-semibold text-gray-900 dark:text-gray-100">No games played yet</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Play some games and check back for rankings.
        </p>
        <Link
          to="/new"
          className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Start a new game
        </Link>
      </div>
    </div>
  );
}
