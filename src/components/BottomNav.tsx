import React from 'react';
import { BellRing, CalendarRange, LayoutList, Settings } from 'lucide-react';
import { ActiveTab } from '../types/reminder';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  urgentCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  urgentCount,
}) => {
  const tabs: {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'reminders', label: 'Reminders', icon: LayoutList },
    { id: 'timeline', label: 'Date Range', icon: CalendarRange },
    { id: 'alerts', label: 'Alerts', icon: BellRing },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md pb-safe md:hidden"
      aria-label="Mobile bottom navigation"
    >
      <div className="grid h-16 grid-cols-4 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative flex min-h-[44px] flex-col items-center justify-center gap-1 transition-colors ${
                active ? 'text-teal-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {tab.id === 'alerts' && urgentCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-600 px-1 text-[10px] font-bold text-white font-mono-nums">
                    {urgentCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] tracking-tight whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
