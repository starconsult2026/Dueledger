import React from 'react';
import { Calendar, Search, X } from 'lucide-react';
import {
  CATEGORY_LABELS,
  DateRangePreset,
  ServiceCategory,
} from '../types/reminder';

interface DateRangeFilterBarProps {
  preset: DateRangePreset;
  onPresetChange: (preset: DateRangePreset) => void;
  customStart: string;
  customEnd: string;
  onCustomStartChange: (val: string) => void;
  onCustomEndChange: (val: string) => void;
  category: ServiceCategory | 'all';
  onCategoryChange: (cat: ServiceCategory | 'all') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  showCompleted: boolean;
  onToggleShowCompleted: () => void;
}

const PRESETS: { id: DateRangePreset; label: string }[] = [
  { id: 'all', label: 'All Dates' },
  { id: 'active_now', label: 'Active Now' },
  { id: 'next_7_days', label: 'Next 7 Days' },
  { id: 'this_month', label: 'This Month' },
  { id: 'custom', label: 'Custom Range' },
];

export const DateRangeFilterBar: React.FC<DateRangeFilterBarProps> = ({
  preset,
  onPresetChange,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
  category,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  showCompleted,
  onToggleShowCompleted,
}) => {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200/90 bg-white p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="flex items-center gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1"
          role="tablist"
          aria-label="Filter by date range"
        >
          {PRESETS.map((item) => {
            const active = preset === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onPresetChange(item.id)}
                className={`min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          <div className="relative min-w-[200px] flex-1 sm:w-56 sm:flex-initial">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search bank or service..."
              aria-label="Search bank or service"
              className="min-h-[42px] w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-8 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-700"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value as ServiceCategory | 'all')}
            aria-label="Filter by service category"
            className="min-h-[42px] rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-teal-600 focus:outline-none"
          >
            <option value="all">All Services</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onToggleShowCompleted}
            className={`min-h-[42px] rounded-xl border px-3 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              showCompleted
                ? 'border-teal-700 bg-teal-50 text-teal-800'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {showCompleted ? 'Showing Completed' : 'Hide Completed'}
          </button>
        </div>
      </div>

      {preset === 'custom' && (
        <div className="flex flex-col gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <Calendar className="h-4 w-4 text-teal-700" />
            <span>Date Range Filter:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <label className="flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:items-center">
              <span>From</span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => onCustomStartChange(e.target.value)}
                className="min-h-[40px] rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 font-mono-nums focus:border-teal-600 focus:bg-white focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:items-center">
              <span>To</span>
              <input
                type="date"
                value={customEnd}
                min={customStart || undefined}
                onChange={(e) => onCustomEndChange(e.target.value)}
                className="min-h-[40px] rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 font-mono-nums focus:border-teal-600 focus:bg-white focus:outline-none"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
