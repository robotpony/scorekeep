import { NavLink } from 'react-router-dom';
import { useSession } from '../../session/context.js';

interface Tab {
  to: string;
  label: string;
  icon: React.ReactNode;
  showBadge?: boolean;
}

function TabBarLink({ to, label, icon, showBadge }: Tab) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `relative flex flex-col items-center gap-0.5 px-3 py-2 text-xs transition-colors ${
          isActive
            ? 'text-accent-text'
            : 'text-faint hover:text-body'
        }`
      }
    >
      <span className="relative">
        {icon}
        {showBadge && (
          <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-accent" aria-label="Active game" />
        )}
      </span>
      <span>{label}</span>
    </NavLink>
  );
}

export function TabBar() {
  const { activeSession } = useSession();
  const hasActive = activeSession !== null && activeSession.status === 'active';

  const tabs: Tab[] = [
    {
      to: '/',
      label: 'Home',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-5">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
        </svg>
      ),
    },
    {
      to: '/new',
      label: 'New Game',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      ),
    },
    {
      to: '/score',
      label: 'Score Sheet',
      showBadge: hasActive,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-5">
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <line x1="8" y1="8" x2="16" y2="8" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="8" y1="16" x2="12" y2="16" />
        </svg>
      ),
    },
    {
      to: '/leaderboard',
      label: 'Leaderboard',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-5">
          <rect x="4" y="14" width="4" height="7" />
          <rect x="10" y="8" width="4" height="13" />
          <rect x="16" y="11" width="4" height="10" />
        </svg>
      ),
    },
  ];

  return (
    <nav aria-label="Main navigation" className="flex justify-around border-t border-edge bg-surface md:border-t-0 md:border-b md:justify-start md:gap-1 md:px-4">
      {tabs.map((tab) => (
        <TabBarLink key={tab.to} {...tab} />
      ))}
    </nav>
  );
}
