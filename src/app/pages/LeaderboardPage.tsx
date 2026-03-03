import { Link } from 'react-router-dom';

export function LeaderboardPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="text-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="mx-auto size-12 text-icon-muted">
          <rect x="4" y="14" width="4" height="7" />
          <rect x="10" y="8" width="4" height="13" />
          <rect x="16" y="11" width="4" height="10" />
        </svg>
        <h1 className="mt-3 text-lg font-semibold text-heading">No games played yet</h1>
        <p className="mt-1 text-sm text-muted">
          Play some games and check back for rankings.
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
