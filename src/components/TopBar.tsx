import React from 'react';
import { Plus } from 'lucide-react';
import { ActiveTab } from '../types/reminder';
import { PWAInstallButton } from './PWAInstallButton';

interface TopBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onCreateNew: () => void;
}

const NAV_ITEMS: { id: ActiveTab; label: string }[] = [
  { id: 'reminders', label: 'Reminders' },
  { id: 'timeline', label: 'Date Range' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'settings', label: 'Settings' },
];

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onTabChange,
  onCreateNew,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md pt-safe">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:h-16 lg:px-8">
        <button
          type="button"
          onClick={() => onTabChange('reminders')}
          className="text-left text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 font-display"
        >
          DueLedger
        </button>

        <nav
          className="hidden md:flex items-center gap-6 text-sm font-medium"
          aria-label="Primary navigation"
        >
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`min-h-[44px] border-b-2 px-1 transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'border-teal-700 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <div className="md:hidden">
            <PWAInstallButton variant="compact" />
          </div>
          <button
            type="button"
            onClick={onCreateNew}
            className="hidden md:inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-medium text-white shadow-xs transition hover:bg-teal-800 active:scale-[0.98] whitespace-nowrap shrink-0"
          >
            <Plus className="h-4 w-4" />
            New Reminder
          </button>
        </div>
      </div>
    </header>
  );
};
