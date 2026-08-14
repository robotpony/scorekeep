import { useEffect, useRef } from 'react';
import type { GameDefinition } from '../../types/game.js';
import { ScoringTable } from './ScoringTable.js';

interface InfoDrawerProps {
  game: GameDefinition;
  open: boolean;
  onClose: () => void;
}

export function InfoDrawer({ game, open, onClose }: InfoDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-label="Game reference">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="relative z-10 max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-t-xl bg-surface p-4 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-heading">{game.game.name}</h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 min-w-11 rounded-lg text-faint hover:text-heading"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-5 mx-auto">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {'rules' in game && game.rules && (
          <div className="mt-3">
            <p className="text-sm text-body">{game.rules.summary}</p>
          </div>
        )}

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-body">Scoring Reference</h3>
          <div className="mt-2">
            <ScoringTable game={game} />
          </div>
        </div>
      </div>
    </div>
  );
}
