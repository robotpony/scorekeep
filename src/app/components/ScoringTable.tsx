import type { GameDefinition } from '../../types/game.js';
import { generateScoringReference } from '../../scoring/index.js';

export function ScoringTable({ game }: { game: GameDefinition }) {
  const ref = generateScoringReference(game);

  return (
    <div className="space-y-4">
      {ref.sections.map((section, i) => (
        <div key={i}>
          {section.title && (
            <h3 className="mb-1 text-sm font-semibold text-body">
              {section.title}
            </h3>
          )}
          {section.entries.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-edge">
                  <th className="py-1.5 pr-4 text-left font-medium text-muted">
                    Name
                  </th>
                  <th className="py-1.5 text-right font-medium text-muted">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {section.entries.map((entry, j) => (
                  <tr key={j} className="border-b border-edge-subtle">
                    <td className="py-1.5 pr-4 text-heading">
                      {entry.label}
                    </td>
                    <td className="py-1.5 text-right text-body">
                      {entry.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {section.note && (
            <p className="mt-1 text-sm italic text-faint">{section.note}</p>
          )}
        </div>
      ))}
    </div>
  );
}
