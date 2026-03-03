import { Link } from 'react-router-dom';
import type { GameDefinition } from '../../types/game.js';

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

export function GameCard({ game: def }: { game: GameDefinition }) {
  const { id, name, type, description } = def.game;
  const badge = typeBadge[type] ?? { label: type, className: 'bg-gray-100 text-gray-800' };

  return (
    <Link
      to={`/game/${id}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{name}</h2>
        <span
          className={`inline-block shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>
      {description && (
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
      )}
    </Link>
  );
}
