import React, { useMemo, useState } from 'react';
import { CalendarPlus, Download, ExternalLink } from 'lucide-react';
import { CATEGORY_LABELS, Reminder } from '../types/reminder';
import { buildGoogleCalendarUrl, downloadIcsFile } from '../utils/calendarExport';
import {
  addDaysToDateString,
  diffCalendarDays,
  formatCurrency,
  formatFullDate,
  formatShortDate,
  getReminderWindowMetrics,
  overlapsDateRange,
  toLocalDateString,
} from '../utils/dateRange';

interface DateRangeTimelineProps {
  reminders: Reminder[];
  onEdit: (reminder: Reminder) => void;
  onMarkCalendarSynced: (id: string) => void;
}

export const DateRangeTimeline: React.FC<DateRangeTimelineProps> = ({
  reminders,
  onEdit,
  onMarkCalendarSynced,
}) => {
  const today = toLocalDateString(new Date());
  const [rangeStart, setRangeStart] = useState(() => addDaysToDateString(today, -7));
  const [rangeEnd, setRangeEnd] = useState(() => addDaysToDateString(today, 23));

  const totalRangeDays = Math.max(1, diffCalendarDays(rangeStart, rangeEnd) + 1);

  const matchingReminders = useMemo(() => {
    return reminders
      .filter((r) => overlapsDateRange(r, rangeStart, rangeEnd))
      .sort((a, b) => a.endDate.localeCompare(b.endDate));
  }, [reminders, rangeStart, rangeEnd]);

  const todayOffsetPct = useMemo(() => {
    const offset = diffCalendarDays(rangeStart, today);
    if (offset < 0 || offset > totalRangeDays) return null;
    return Math.min(100, Math.max(0, (offset / totalRangeDays) * 100));
  }, [rangeStart, today, totalRangeDays]);

  const handleExportRange = () => {
    if (matchingReminders.length === 0) return;
    downloadIcsFile(
      matchingReminders,
      `dueledger-${rangeStart}-to-${rangeEnd}.ics`
    );
    matchingReminders.forEach((r) => onMarkCalendarSynced(r.id));
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 font-display">
              Date Range Window Timeline
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Inspect overlapping bank and service periods across any date range and export them to Google Calendar.
            </p>
          </div>

          <button
            type="button"
            disabled={matchingReminders.length === 0}
            onClick={handleExportRange}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <Download className="h-4 w-4" />
            Export Range to Calendar (.ics)
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3 sm:items-end">
          <div>
            <label className="block text-xs font-medium text-slate-600">
              Range Start Date
            </label>
            <input
              type="date"
              value={rangeStart}
              onChange={(e) => {
                const v = e.target.value;
                setRangeStart(v);
                if (v > rangeEnd) setRangeEnd(v);
              }}
              className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 font-mono-nums focus:border-teal-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600">
              Range End Date
            </label>
            <input
              type="date"
              value={rangeEnd}
              min={rangeStart}
              onChange={(e) => setRangeEnd(e.target.value)}
              className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 font-mono-nums focus:border-teal-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setRangeStart(addDaysToDateString(today, -7));
                setRangeEnd(addDaysToDateString(today, 23));
              }}
              className="min-h-[44px] rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              30-Day View
            </button>
            <button
              type="button"
              onClick={() => {
                const d = new Date();
                const first = new Date(d.getFullYear(), d.getMonth(), 1);
                const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
                setRangeStart(toLocalDateString(first));
                setRangeEnd(toLocalDateString(last));
              }}
              className="min-h-[44px] rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              Current Month
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs text-slate-500 font-mono-nums">
          <span>{formatFullDate(rangeStart)}</span>
          <span>
            {matchingReminders.length} {matchingReminders.length === 1 ? 'window' : 'windows'} in range ({totalRangeDays}d)
          </span>
          <span>{formatFullDate(rangeEnd)}</span>
        </div>

        {matchingReminders.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-slate-700">
              No bank or service windows overlap this date range.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Widen the start or end date above to view upcoming schedules.
            </p>
          </div>
        ) : (
          <div className="relative mt-4 space-y-4">
            {todayOffsetPct !== null && (
              <div
                className="pointer-events-none absolute bottom-0 top-0 z-10 w-px bg-rose-500/70"
                style={{ left: `${todayOffsetPct}%` }}
              >
                <span className=" -translate-x-1/2 rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  Today
                </span>
              </div>
            )}

            {matchingReminders.map((reminder) => {
              const metrics = getReminderWindowMetrics(reminder);
              const clampedStart = reminder.startDate < rangeStart ? rangeStart : reminder.startDate;
              const clampedEnd = reminder.endDate > rangeEnd ? rangeEnd : reminder.endDate;
              const leftPct = Math.max(
                0,
                (diffCalendarDays(rangeStart, clampedStart) / totalRangeDays) * 100
              );
              const widthPct = Math.max(
                4,
                ((diffCalendarDays(clampedStart, clampedEnd) + 1) / totalRangeDays) * 100
              );

              const barColor =
                metrics.status === 'completed'
                  ? 'bg-emerald-600'
                  : metrics.status === 'overdue'
                    ? 'bg-rose-600'
                    : metrics.status === 'due_soon'
                      ? 'bg-amber-600'
                      : 'bg-teal-700';

              const amount = formatCurrency(reminder.amount, reminder.currency);

              return (
                <div
                  key={reminder.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(reminder)}
                      className="text-left hover:underline"
                    >
                      <span className="text-sm font-semibold text-slate-900">
                        {reminder.title}
                      </span>
                      <span className="ml-2 text-xs text-slate-500">
                        {CATEGORY_LABELS[reminder.category]} · {reminder.provider}
                      </span>
                    </button>

                    <div className="flex items-center gap-3 text-xs">
                      {amount && (
                        <span className="font-semibold text-slate-800 font-mono-nums">
                          {amount}
                        </span>
                      )}
                      <span className="font-medium text-slate-600 font-mono-nums">
                        {formatShortDate(reminder.startDate)} – {formatShortDate(reminder.endDate)}
                      </span>
                      <a
                        href={buildGoogleCalendarUrl(reminder)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => onMarkCalendarSynced(reminder.id)}
                        className="inline-flex items-center gap-1 font-medium text-teal-700 hover:text-teal-900"
                      >
                        <CalendarPlus className="h-3.5 w-3.5" />
                        <span>Add</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  <div className="relative mt-2.5 h-3 w-full overflow-hidden rounded-full bg-slate-200/70">
                    <div
                      className={`absolute top-0 h-full rounded-full ${barColor}`}
                      style={{
                        left: `${leftPct}%`,
                        width: `${Math.min(100 - leftPct, widthPct)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
