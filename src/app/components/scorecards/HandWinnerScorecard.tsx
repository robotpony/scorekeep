import { useState } from 'react';
import type { HandWinnerGameSession } from '../../../types/session.js';
import type { CardGameDefinition } from '../../../types/game.js';
import { useSession } from '../../../session/context.js';
import { determineHandWinner, computeFinalScores } from '../../../scoring/final.js';
import { GameOverBanner } from './GameOverBanner.js';

interface Props {
  session: HandWinnerGameSession;
  gameDef: CardGameDefinition;
}

export function HandWinnerScorecard({ session, gameDef }: Props) {
  const { dispatch, canUndo } = useSession();
  const [pendingScores, setPendingScores] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  const { players, hand_scores, hand_winners, hand_win_values, current_round, carryover } = session;
  const { scoring, scorecard } = gameDef;
  const isFinished = session.status === 'finished';
  const totalRounds = scoring.rounds;

  // Compute win counts
  const winCounts = players.map(() => 0);
  for (let r = 0; r < hand_winners.length; r++) {
    const winnerName = hand_winners[r];
    if (winnerName !== null) {
      const idx = players.indexOf(winnerName);
      if (idx >= 0) winCounts[idx] += hand_win_values[r] ?? 1;
    }
  }

  const cumulatives = hand_scores.map(s => s.reduce((a, b) => a + b, 0));

  function updatePending(playerIndex: number, value: string) {
    setPendingScores(prev => ({ ...prev, [playerIndex]: value }));
    setError(null);
  }

  function submitHand() {
    const values: number[] = [];
    for (let i = 0; i < players.length; i++) {
      const raw = pendingScores[i] ?? '';
      if (raw === '') {
        setError('Enter a score for every player.');
        return;
      }
      const num = Number(raw);
      if (isNaN(num) || num < 0) {
        setError(`"${raw}" is not a valid score.`);
        return;
      }
      values.push(num);
    }

    const result = determineHandWinner(values, players, scoring.hand.winner, scoring.hand.tie);
    dispatch({
      type: 'RECORD_SCORE',
      payload: { scores: values, winner: result.winner, winValue: result.value },
    });
    setPendingScores({});
    setError(null);

    // Check if all rounds done
    if (current_round + 1 >= totalRounds) {
      // We need to compute with the updated session
      const tempSession: HandWinnerGameSession = {
        ...session,
        hand_scores: hand_scores.map((s, i) => [...s, values[i]]),
        hand_winners: [...hand_winners, result.winner],
        hand_win_values: [...hand_win_values, result.winner !== null ? result.value + carryover : 0],
        carryover: result.winner === null ? carryover + 1 : 0,
        current_round: current_round + 1,
      };
      const final = computeFinalScores(tempSession, gameDef);
      dispatch({ type: 'END_GAME', winner: players[final.winner] });
    }
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
              <th className="py-2 pr-4 text-left text-muted">Hand</th>
              {players.map(name => (
                <th key={name} className="py-2 px-2 text-center text-muted">{name}</th>
              ))}
              {scorecard.mark_winner && (
                <th className="py-2 px-2 text-center text-muted">Winner</th>
              )}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: current_round }, (_, r) => (
              <tr key={r} className="border-b border-edge-subtle">
                <td className="py-2 pr-4 text-faint">{r + 1}</td>
                {players.map((name, i) => (
                  <td key={name} className={`py-2 px-2 text-center ${
                    hand_winners[r] === name ? 'text-accent-text font-bold' : 'text-heading'
                  }`}>
                    {hand_scores[i][r]}
                  </td>
                ))}
                {scorecard.mark_winner && (
                  <td className="py-2 px-2 text-center text-sm">
                    {hand_winners[r] ? (
                      <span className="text-accent-text">
                        {hand_winners[r]}
                        {hand_win_values[r] > 1 ? ` (${hand_win_values[r]})` : ''}
                      </span>
                    ) : (
                      <span className="text-faint">carry</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-edge">
              <td className="py-2 pr-4 text-body font-semibold">Wins</td>
              {players.map((name, i) => (
                <td key={name} className="py-2 px-2 text-center font-semibold text-heading">
                  {winCounts[i]}
                </td>
              ))}
              {scorecard.mark_winner && <td />}
            </tr>
            <tr>
              <td className="py-1 pr-4 text-xs text-faint">Cumulative</td>
              {players.map((name, i) => (
                <td key={name} className="py-1 px-2 text-center text-xs text-faint">
                  {cumulatives[i]}
                </td>
              ))}
              {scorecard.mark_winner && <td />}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* New hand input */}
      <div className="mt-4 rounded-lg border border-accent bg-surface p-4">
        <h3 className="text-sm font-semibold text-heading">
          Hand {current_round + 1} of {totalRounds}
          {carryover > 0 && <span className="ml-2 text-accent-text">(+{carryover} carry)</span>}
        </h3>
        <div className="mt-2 flex gap-2 flex-wrap">
          {players.map((name, i) => (
            <div key={name} className="flex flex-col items-center gap-1">
              <label className="text-xs text-faint">{name}</label>
              <input
                type="text"
                inputMode="numeric"
                value={pendingScores[i] ?? ''}
                onChange={e => updatePending(i, e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submitHand(); }}
                placeholder="0"
                aria-label={`${name} hand ${current_round + 1} score`}
                className="min-h-11 w-20 rounded-lg border border-edge bg-surface px-2 text-center text-heading placeholder:text-faint"
              />
            </div>
          ))}
        </div>
        {error && <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={submitHand}
            className="min-h-11 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            Submit hand
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
      </div>
    </div>
  );
}
