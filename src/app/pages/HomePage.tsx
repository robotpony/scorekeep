import { gameList } from '../../definitions/games.js';
import { GameCard } from '../components/GameCard.js';

export function HomePage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-heading">Scorekeep</h1>
      <p className="mt-1 text-muted">Choose a game to get started.</p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {gameList.map((game) => (
          <GameCard key={game.game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
