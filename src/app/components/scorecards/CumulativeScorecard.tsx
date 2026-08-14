import { useState } from 'react';
import type { CumulativeGameSession } from '../../../types/session.js';
import type { DiceCumulativeGame } from '../../../types/game.js';
import { useSession } from '../../../session/context.js';
import { validateCumulativeEntry } from '../../../scoring/validation.js';
import { checkGameOver } from '../../../scoring/endgame.js';
import { computeFinalScores } from '../../../scoring/final.js';
import { GameOverBanner } from './GameOverBanner.js';

interface Props {
  session: CumulativeGameSession;
  gameDef: DiceCumulativeGame;
}

export function CumulativeScorecard({ session, gameDef }: Props) {
  const { dispatch, canUndo } = useSession();
  const [accumulated, setAccumulated] = useState(0);
  const [directInput, setDirectInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { players, scores, current_player } = session;
  const isFinished = session.status === 'finished';
  const { scoring, scorecard } = gameDef;

  // Quick-add amounts derived from scoring rules
  const quickAmounts = new Set<number>();
  const singles = scoring.singles;
  for (const key of Object.keys(singles)) {
    quickAmounts.add(singles[key]);
  }
  // Add some common of-a-kind values
  for (let face = 1; face <= gameDef.equipment.dice_sides; face++) {
    const key = String(face);
    const base = key in (scoring.of_a_kind.overrides ?? {})
      ? scoring.of_a_kind.overrides[key]
      : face * scoring.of_a_kind.multiplier;
    quickAmounts.add(base);
  }
  const sortedAmounts = [...quickAmounts].sort((a, b) => a - b);

  const runningTotals = scores.map(s => s.reduce((a, b) => a + b, 0));
  const roundCount = Math.max(...scores.map(s => s.length), 0);

  function addToAccumulated(amount: number) {
    setAccumulated(prev => prev + amount);
    setError(null);
  }

  function bankScore() {
    const score = accumulated > 0 ? accumulated : Number(directInput) || 0;
    const result = validateCumulativeEntry(score, current_player, session, gameDef);
    if (!result.valid) {
      setError(result.error!);
      return;
    }
    dispatch({ type: 'RECORD_SCORE', payload: { playerIndex: current_player, score } });
    setAccumulated(0);
    setDirectInput('');
    setError(null);

    // Check endgame after recording
    const updatedScores = scores.map((s, i) =>
      i === current_player ? [...s, score] : s,
    );
    const updatedTotal = updatedScores[current_player].reduce((a, b) => a + b, 0);
    if (updatedTotal >= scoring.target && scoring.endgame === 'immediate') {
      dispatch({ type: 'END_GAME', winner: players[current_player] });
    }
  }

  function farkle() {
    dispatch({ type: 'RECORD_SCORE', payload: { playerIndex: current_player, score: 0 } });
    setAccumulated(0);
    setDirectInput('');
    setError(null);
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
              <th className="py-2 pr-4 text-left text-muted">Turn</th>
              {players.map((name, i) => (
                <th key={name} className={`py-2 px-2 text-center ${i === current_player ? 'text-accent-text font-bold' : 'text-muted'}`}>
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: roundCount }, (_, r) => (
              <tr key={r} className="border-b border-edge-subtle">
                <td className="py-2 pr-4 text-faint">{r + 1}</td>
                {players.map((name, i) => (
                  <td key={name} className="py-2 px-2 text-center text-heading">
                    {scores[i][r] !== undefined ? (scores[i][r] === 0 ? '—' : `+${scores[i][r]}`) : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-edge font-semibold">
              <td className="py-2 pr-4 text-body">Total</td>
              {players.map((name, i) => (
                <td key={name} className={`py-2 px-2 text-center ${i === current_player ? 'text-accent-text' : 'text-heading'}`}>
                  {runningTotals[i]}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Current turn */}
      <div className="mt-4 rounded-lg border border-accent bg-surface p-4">
        <h3 className="text-sm font-semibold text-heading">
          {players[current_player]}&apos;s turn
        </h3>

        {/* Accumulated display */}
        {accumulated > 0 && (
          <p className="mt-1 text-lg font-bold text-accent-text">{accumulated}</p>
        )}

        {/* Quick-add buttons */}
        <div className="mt-2 flex flex-wrap gap-2">
          {sortedAmounts.map(amount => (
            <button
              key={amount}
              type="button"
              onClick={() => addToAccumulated(amount)}
              className="min-h-11 rounded-lg border border-edge bg-surface px-3 py-2 text-sm font-medium text-heading hover:border-accent"
            >
              +{amount}
            </button>
          ))}
        </div>

        {/* Direct entry fallback */}
        <div className="mt-2 flex items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={directInput}
            onChange={e => { setDirectInput(e.target.value); setAccumulated(0); }}
            placeholder="or enter score"
            aria-label="Direct score entry"
            className="min-h-11 w-32 rounded-lg border border-edge bg-surface px-2 text-center text-heading placeholder:text-faint"
          />
        </div>

        {error && <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>}

        {/* Action buttons */}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={bankScore}
            className="min-h-11 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            {scorecard.commit_label ?? 'Bank'}
          </button>
          <button
            type="button"
            onClick={farkle}
            className="min-h-11 rounded-lg border border-edge px-4 py-2 text-sm font-medium text-body hover:bg-surface"
          >
            {scorecard.zero_label ?? 'Zero'}
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
        </div>

        {/* Target progress */}
        <p className="mt-2 text-xs text-faint">
          Target: {scoring.target.toLocaleString()}
          {!runningTotals.some((t, i) => scores[i].some(s => s > 0)) && (
            <> &middot; First score must be {scoring.entry_threshold.toLocaleString()}+</>
          )}
        </p>
      </div>
    </div>
  );
}
