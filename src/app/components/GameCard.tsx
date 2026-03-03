import { Link } from 'react-router-dom';
import type { GameDefinition } from '../../types/game.js';
import { getBadge } from './badges.js';

export function GameCard({ game: def }: { game: GameDefinition }) {
  const { id, name, type, description } = def.game;
  const badge = getBadge(type);

  return (
    <Link
      to={`/game/${id}`}
      className="block rounded-lg border border-edge bg-surface p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-lg font-semibold text-heading">{name}</h2>
        <span
          className={`inline-block shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>
      {description && (
        <p className="mt-1 text-sm text-muted">{description}</p>
      )}
    </Link>
  );
}
