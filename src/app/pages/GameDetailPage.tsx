import { Link, useParams } from 'react-router-dom';
import { games } from '../../definitions/games.js';
import { isDiceGame, isCardGame } from '../../types/game.js';
import type { GameDefinition } from '../../types/game.js';
import { ScoringTable } from '../components/ScoringTable.js';

function equipmentText(def: GameDefinition): string | null {
  if (isDiceGame(def)) {
    return `${def.equipment.dice_count} ${def.equipment.dice_sides}-sided dice`;
  }
  if (isCardGame(def)) {
    const deck = def.equipment.deck.replace('-', ' ');
    return `${deck} deck, ${def.equipment.cards_per_player} cards per player`;
  }
  return null;
}

export function GameDetailPage() {
  const { id } = useParams<{ id: string }>();
  const def = id ? games[id] : undefined;

  if (!def) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Game not found</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          No game with ID &ldquo;{id}&rdquo; exists.
        </p>
        <Link to="/" className="mt-3 inline-block text-indigo-600 hover:underline dark:text-indigo-400">
          Back to games
        </Link>
      </div>
    );
  }

  const { name, description } = def.game;
  const equipment = equipmentText(def);

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{name}</h1>
      {description && (
        <p className="mt-1 text-gray-600 dark:text-gray-400">{description}</p>
      )}

      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-700 dark:text-gray-300">
        <div>
          <dt className="inline font-medium">Players:</dt>{' '}
          <dd className="inline">{def.players.min}–{def.players.max}</dd>
        </div>
        {equipment && (
          <div>
            <dt className="inline font-medium">Equipment:</dt>{' '}
            <dd className="inline">{equipment}</dd>
          </div>
        )}
      </dl>

      {'rules' in def && def.rules && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Rules</h2>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{def.rules.summary}</p>

          {def.rules.turn_flow && (
            <>
              <h3 className="mt-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Turn flow</h3>
              <ol className="mt-1 list-inside list-decimal space-y-0.5 text-sm text-gray-700 dark:text-gray-300">
                {def.rules.turn_flow.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </>
          )}

          {def.rules.key_rules && (
            <>
              <h3 className="mt-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Key rules</h3>
              <ul className="mt-1 list-inside list-disc space-y-0.5 text-sm text-gray-700 dark:text-gray-300">
                {def.rules.key_rules.map((rule, i) => (
                  <li key={i}>{rule}</li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Scoring</h2>
        <div className="mt-2">
          <ScoringTable game={def} />
        </div>
      </section>

      <div className="mt-6">
        <Link
          to={`/new?game=${def.game.id}`}
          className="inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Play this game
        </Link>
      </div>
    </div>
  );
}
