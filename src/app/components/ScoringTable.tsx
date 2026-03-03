import type { GameDefinition } from '../../types/game.js';
import { generateScoringReference } from '../../scoring/index.js';

export function ScoringTable({ game }: { game: GameDefinition }) {
  const ref = generateScoringReference(game);

  return (
    <div className="space-y-4">
      {ref.sections.map((section, i) => (
        <div key={i}>
          {section.title && (
            <h3 className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
              {section.title}
            </h3>
          )}
          {section.entries.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-1.5 pr-4 text-left font-medium text-gray-600 dark:text-gray-400">
                    Name
                  </th>
                  <th className="py-1.5 text-right font-medium text-gray-600 dark:text-gray-400">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {section.entries.map((entry, j) => (
                  <tr key={j} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-1.5 pr-4 text-gray-900 dark:text-gray-100">
                      {entry.label}
                    </td>
                    <td className="py-1.5 text-right text-gray-700 dark:text-gray-300">
                      {entry.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {section.note && (
            <p className="mt-1 text-sm italic text-gray-500 dark:text-gray-400">{section.note}</p>
          )}
        </div>
      ))}
    </div>
  );
}
