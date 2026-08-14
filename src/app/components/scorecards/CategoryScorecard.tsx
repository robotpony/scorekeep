import { useState } from 'react';
import type { CategoryGameSession } from '../../../types/session.js';
import type { DiceCategoryGame } from '../../../types/game.js';
import { useSession } from '../../../session/context.js';
import { validateCategoryEntry, categoryNameForFace } from '../../../scoring/validation.js';
import { checkGameOver } from '../../../scoring/endgame.js';
import { computeFinalScores } from '../../../scoring/final.js';
import { GameOverBanner } from './GameOverBanner.js';

interface Props {
  session: CategoryGameSession;
  gameDef: DiceCategoryGame;
}

export function CategoryScorecard({ session, gameDef }: Props) {
  const { dispatch, canUndo } = useSession();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [scoreInput, setScoreInput] = useState('');
  const [isYahtzeeBonus, setIsYahtzeeBonus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { players, category_scores, yahtzee_bonuses, current_player } = session;
  const { upper, lower, yahtzee_bonus } = gameDef.scoring;
  const { dice_count } = gameDef.equipment;
  const isFinished = session.status === 'finished';

  const upperCategories = upper.faces.map(f => categoryNameForFace(f));
  const lowerCategories = lower.map(c => c.name);
  const allCategories = [...upperCategories, ...lowerCategories];

  function submitScore() {
    if (!selectedCategory) {
      setError('Select a category first.');
      return;
    }

    const score = Number(scoreInput);
    if (scoreInput === '' || isNaN(score)) {
      setError('Enter a valid score.');
      return;
    }

    const result = validateCategoryEntry(selectedCategory, score, current_player, session, gameDef);
    if (!result.valid) {
      setError(result.error!);
      return;
    }

    dispatch({
      type: 'RECORD_SCORE',
      payload: { playerIndex: current_player, category: selectedCategory, score, isYahtzeeBonus },
    });

    setSelectedCategory(null);
    setScoreInput('');
    setIsYahtzeeBonus(false);
    setError(null);

    // Check if game is over
    const updatedScores = category_scores.map((cs, i) =>
      i === current_player ? { ...cs, [selectedCategory]: score } : cs,
    );
    const tempSession = { ...session, category_scores: updatedScores };
    const endgame = checkGameOver(tempSession, gameDef);
    if (endgame.over) {
      const final = computeFinalScores(tempSession, gameDef);
      dispatch({ type: 'END_GAME', winner: players[final.winner] });
    }
  }

  function getUpperSubtotal(playerIndex: number): number {
    return upperCategories.reduce((sum, cat) => sum + (category_scores[playerIndex][cat] ?? 0), 0);
  }

  function getLowerSubtotal(playerIndex: number): number {
    return lowerCategories.reduce((sum, cat) => sum + (category_scores[playerIndex][cat] ?? 0), 0);
  }

  function getBonus(playerIndex: number): number {
    return getUpperSubtotal(playerIndex) >= upper.bonus_threshold ? upper.bonus_value : 0;
  }

  function getTotal(playerIndex: number): number {
    return getUpperSubtotal(playerIndex) + getBonus(playerIndex) + getLowerSubtotal(playerIndex) + yahtzee_bonuses[playerIndex] * yahtzee_bonus.value;
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

  function renderCategoryRow(category: string) {
    return (
      <tr
        key={category}
        className={`border-b border-edge-subtle cursor-pointer ${
          selectedCategory === category ? 'bg-accent/10' : ''
        }`}
        onClick={() => {
          // Only selectable if not filled for current player
          if (!(category in category_scores[current_player])) {
            setSelectedCategory(category);
            setError(null);
          }
        }}
      >
        <td className="py-2 pr-4 text-heading text-sm">{category}</td>
        {players.map((name, i) => {
          const score = category_scores[i][category];
          const isFilled = score !== undefined;
          return (
            <td key={name} className={`py-2 px-2 text-center text-sm ${
              i === current_player && !isFilled ? 'text-accent-text' : 'text-heading'
            }`}>
              {isFilled ? score : '—'}
            </td>
          );
        })}
      </tr>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-edge">
              <th className="py-2 pr-4 text-left text-muted">Category</th>
              {players.map((name, i) => (
                <th key={name} className={`py-2 px-2 text-center ${i === current_player ? 'text-accent-text font-bold' : 'text-muted'}`}>
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Upper section */}
            <tr><td colSpan={players.length + 1} className="pt-2 pb-1 text-xs font-semibold text-faint uppercase tracking-wide">Upper Section</td></tr>
            {upperCategories.map(cat => renderCategoryRow(cat))}
            <tr className="border-b border-edge bg-edge-subtle">
              <td className="py-1 pr-4 text-xs text-faint">Upper subtotal</td>
              {players.map((_, i) => (
                <td key={i} className="py-1 px-2 text-center text-xs text-faint">
                  {getUpperSubtotal(i)} / {upper.bonus_threshold}
                </td>
              ))}
            </tr>
            <tr className="border-b border-edge bg-edge-subtle">
              <td className="py-1 pr-4 text-xs text-faint">Bonus</td>
              {players.map((_, i) => (
                <td key={i} className="py-1 px-2 text-center text-xs text-faint">
                  {getBonus(i) > 0 ? `+${getBonus(i)}` : '—'}
                </td>
              ))}
            </tr>

            {/* Lower section */}
            <tr><td colSpan={players.length + 1} className="pt-3 pb-1 text-xs font-semibold text-faint uppercase tracking-wide">Lower Section</td></tr>
            {lowerCategories.map(cat => renderCategoryRow(cat))}

            {/* Yahtzee bonus */}
            {yahtzee_bonus.value > 0 && (
              <tr className="border-b border-edge bg-edge-subtle">
                <td className="py-1 pr-4 text-xs text-faint">Yahtzee Bonus</td>
                {players.map((_, i) => (
                  <td key={i} className="py-1 px-2 text-center text-xs text-faint">
                    {yahtzee_bonuses[i] > 0 ? `+${yahtzee_bonuses[i] * yahtzee_bonus.value}` : '—'}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t border-edge font-semibold">
              <td className="py-2 pr-4 text-body">Total</td>
              {players.map((name, i) => (
                <td key={name} className={`py-2 px-2 text-center ${i === current_player ? 'text-accent-text' : 'text-heading'}`}>
                  {getTotal(i)}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Score entry */}
      <div className="mt-4 rounded-lg border border-accent bg-surface p-4">
        <h3 className="text-sm font-semibold text-heading">
          {players[current_player]}&apos;s turn
          {selectedCategory && <> &mdash; {selectedCategory}</>}
        </h3>

        {selectedCategory ? (
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={scoreInput}
                onChange={e => { setScoreInput(e.target.value); setError(null); }}
                onKeyDown={e => { if (e.key === 'Enter') submitScore(); }}
                placeholder="Score"
                aria-label={`Score for ${selectedCategory}`}
                className="min-h-11 w-24 rounded-lg border border-edge bg-surface px-2 text-center text-heading placeholder:text-faint"
              />
              <button
                type="button"
                onClick={submitScore}
                className="min-h-11 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
              >
                Submit
              </button>
            </div>
            {/* Yahtzee bonus checkbox */}
            {category_scores[current_player]['Yahtzee'] !== undefined && category_scores[current_player]['Yahtzee'] > 0 && (
              <label className="mt-2 flex items-center gap-2 text-sm text-body">
                <input
                  type="checkbox"
                  checked={isYahtzeeBonus}
                  onChange={e => setIsYahtzeeBonus(e.target.checked)}
                />
                Yahtzee bonus (+{yahtzee_bonus.value})
              </label>
            )}
          </div>
        ) : (
          <p className="mt-1 text-sm text-faint">Tap a category above to score.</p>
        )}

        {error && <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>}

        <div className="mt-3 flex gap-2">
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
