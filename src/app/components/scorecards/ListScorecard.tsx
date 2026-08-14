import { useState } from 'react';
import type { ListGameSession } from '../../../types/session.js';
import type { ListGameDefinition } from '../../../types/game.js';
import { useSession } from '../../../session/context.js';
import { computeFinalScores } from '../../../scoring/final.js';
import { GameOverBanner } from './GameOverBanner.js';

interface Props {
  session: ListGameSession;
  gameDef: ListGameDefinition;
}

export function ListScorecard({ session, gameDef }: Props) {
  const { dispatch, canUndo } = useSession();
  const [pendingScores, setPendingScores] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  const { players, scores } = session;
  const roundCount = Math.max(...scores.map(s => s.length), 0);
  const totals = scores.map(s => s.reduce((a, b) => a + b, 0));
  const isFinished = session.status === 'finished';

  function updatePending(playerIndex: number, value: string) {
    setPendingScores(prev => ({ ...prev, [playerIndex]: value }));
    setError(null);
  }

  function submitRound() {
    const values: number[] = [];
    for (let i = 0; i < players.length; i++) {
      const raw = pendingScores[i] ?? '';
      if (raw === '') {
        setError('Enter a score for every player.');
        return;
      }
      const num = Number(raw);
      if (isNaN(num)) {
        setError(`"${raw}" is not a valid number.`);
        return;
      }
      values.push(num);
    }

    // Record all scores for this round
    for (let i = 0; i < players.length; i++) {
      dispatch({ type: 'RECORD_SCORE', payload: { playerIndex: i, score: values[i] } });
    }
    setPendingScores({});
  }

  function endGame() {
    const result = computeFinalScores(session, gameDef);
    dispatch({ type: 'END_GAME', winner: players[result.winner] });
  }

  if (isFinished) {
    const result = computeFinalScores(session, gameDef);
    return (
      <GameOverBanner
        winner={session.winner ?? players[result.winner]}
        totals={result.totals}
        players={players}
        gameDef={gameDef}
      />
    );
  }

  return (
    <div>
      {/* Score table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-edge">
              <th className="py-2 pr-4 text-left text-muted">Round</th>
              {players.map(name => (
                <th key={name} className="py-2 px-2 text-center text-muted">{name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: roundCount }, (_, r) => (
              <tr key={r} className="border-b border-edge-subtle">
                <td className="py-2 pr-4 text-faint">{r + 1}</td>
                {players.map((name, i) => (
                  <td key={name} className="py-2 px-2 text-center text-heading">
                    {scores[i][r] ?? ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-edge font-semibold">
              <td className="py-2 pr-4 text-body">Total</td>
              {players.map((name, i) => (
                <td key={name} className="py-2 px-2 text-center text-heading">{totals[i]}</td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* New round inputs */}
      <div className="mt-4">
        <h3 className="text-sm font-medium text-body">Round {roundCount + 1}</h3>
        <div className="mt-2 flex gap-2 flex-wrap">
          {players.map((name, i) => (
            <div key={name} className="flex flex-col items-center gap-1">
              <label className="text-xs text-faint">{name}</label>
              <input
                type="text"
                inputMode="numeric"
                value={pendingScores[i] ?? ''}
                onChange={e => updatePending(i, e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submitRound(); }}
                placeholder="0"
                aria-label={`${name} round ${roundCount + 1} score`}
                className="min-h-11 w-20 rounded-lg border border-edge bg-surface px-2 text-center text-heading placeholder:text-faint"
              />
            </div>
          ))}
        </div>
        {error && <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={submitRound}
            className="min-h-11 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            Add round
          </button>
          {canUndo && (
            <button
              type="button"
              onClick={() => dispatch({ type: 'UNDO_LAST' })}
              className="min-h-11 rounded-lg border border-edge px-4 py-2 text-sm font-medium text-body hover:bg-surface"
            >
              Undo
            </button>
          )}
          {roundCount > 0 && (
            <button
              type="button"
              onClick={endGame}
              className="min-h-11 rounded-lg border border-edge px-4 py-2 text-sm font-medium text-body hover:bg-surface"
            >
              End game
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
