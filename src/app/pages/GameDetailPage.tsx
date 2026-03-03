import { useParams } from 'react-router-dom';

export function GameDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Game: {id}</h1>
      <p className="mt-1 text-gray-600 dark:text-gray-400">Game detail coming soon.</p>
    </div>
  );
}
