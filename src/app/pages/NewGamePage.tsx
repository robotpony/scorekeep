import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { gameList, games } from '../../definitions/games.js';
import { getBadge } from '../components/badges.js';
import { useSession } from '../../session/context.js';
import { sessionTypeForGame } from '../../session/helpers.js';

export function NewGamePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { dispatch } = useSession();

  const preselectedId = searchParams.get('game');
  const [selectedId, setSelectedId] = useState<string>(preselectedId ?? '');
  const [playerNames, setPlayerNames] = useState<string[]>(['', '']);
  const [error, setError] = useState<string | null>(null);

  const selectedGame = selectedId ? games[selectedId] : null;

  // Adjust player input count when game changes
  useEffect(() => {
    if (selectedGame) {
      const min = selectedGame.players.min;
      setPlayerNames(prev => {
        if (prev.length < min) {
          return [...prev, ...Array(min - prev.length).fill('')];
        }
        return prev.slice(0, Math.max(prev.length, min));
      });
    }
  }, [selectedId]);

  function updatePlayer(index: number, name: string) {
    setPlayerNames(prev => prev.map((n, i) => i === index ? name : n));
    setError(null);
  }

  function addPlayer() {
    if (selectedGame && playerNames.length < selectedGame.players.max) {
      setPlayerNames(prev => [...prev, '']);
    }
  }

  function removePlayer(index: number) {
    if (selectedGame && playerNames.length > selectedGame.players.min) {
      setPlayerNames(prev => prev.filter((_, i) => i !== index));
    }
  }

  function startGame() {
    if (!selectedGame) {
      setError('Select a game first.');
      return;
    }

    const trimmed = playerNames.map(n => n.trim());
    const empty = trimmed.some(n => n === '');
    if (empty) {
      setError('All player names are required.');
      return;
    }

    const unique = new Set(trimmed);
    if (unique.size !== trimmed.length) {
      setError('Player names must be unique.');
      return;
    }

    const { min, max } = selectedGame.players;
    if (trimmed.length < min || trimmed.length > max) {
      setError(`This game requires ${min}–${max} players.`);
      return;
    }

    const sessionType = sessionTypeForGame(selectedGame);
    dispatch({ type: 'CREATE_SESSION', gameId: selectedId, players: trimmed, sessionType });
    navigate('/score');
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="text-2xl font-bold text-heading">Start a new game</h1>
      <p className="mt-1 text-muted">
        Pick a game, then add players.
      </p>

      {/* Game selector */}
      <fieldset className="mt-4">
        <legend className="text-sm font-medium text-body">Choose a game</legend>
        <ul className="mt-2 space-y-2" role="radiogroup">
          {gameList.map((def) => {
            const badge = getBadge(def.game.type);
            const isSelected = selectedId === def.game.id;
            return (
              <li key={def.game.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => { setSelectedId(def.game.id); setError(null); }}
                  className={`w-full flex items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                    isSelected
                      ? 'border-accent bg-surface ring-2 ring-accent'
                      : 'border-edge bg-surface hover:border-accent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-heading">{def.game.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                  <span className="text-xs text-faint">{def.players.min}–{def.players.max} players</span>
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>

      {/* Player inputs */}
      {selectedGame && (
        <fieldset className="mt-6">
          <legend className="text-sm font-medium text-body">
            Players ({selectedGame.players.min}–{selectedGame.players.max})
          </legend>
          <div className="mt-2 space-y-2">
            {playerNames.map((name, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={e => updatePlayer(i, e.target.value)}
                  placeholder={`Player ${i + 1}`}
                  className="min-h-11 flex-1 rounded-lg border border-edge bg-surface px-3 text-heading placeholder:text-faint"
                  inputMode="text"
                  aria-label={`Player ${i + 1} name`}
                />
                {playerNames.length > selectedGame.players.min && (
                  <button
                    type="button"
                    onClick={() => removePlayer(i)}
                    className="min-h-11 min-w-11 rounded-lg border border-edge text-faint hover:text-heading hover:border-accent"
                    aria-label={`Remove player ${i + 1}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="mx-auto size-4">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          {playerNames.length < selectedGame.players.max && (
            <button
              type="button"
              onClick={addPlayer}
              className="mt-2 text-sm text-accent-text hover:underline"
            >
              + Add player
            </button>
          )}
        </fieldset>
      )}

      {/* Error */}
      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">{error}</p>
      )}

      {/* Start button */}
      <button
        type="button"
        onClick={startGame}
        disabled={!selectedGame}
        className="mt-6 min-h-11 w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Start game
      </button>
    </div>
  );
}
