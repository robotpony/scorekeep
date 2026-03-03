import { Outlet } from 'react-router-dom';
import { TabBar } from './TabBar.js';

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      {/* Top bar on md+ screens */}
      <div className="hidden md:block">
        <TabBar />
      </div>

      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* Bottom bar on mobile */}
      <div className="fixed inset-x-0 bottom-0 md:hidden">
        <TabBar />
      </div>
    </div>
  );
}
