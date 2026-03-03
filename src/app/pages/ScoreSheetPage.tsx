import { Link } from 'react-router-dom';

export function ScoreSheetPage() {
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
