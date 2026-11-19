import React from 'react';
import {
  Bell,
  CalendarPlus,
  CheckCircle2,
  Circle,
  Download,
  ExternalLink,
  Pencil,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import {
  CATEGORY_LABELS,
  RECURRENCE_LABELS,
  Reminder,
} from '../types/reminder';
import { buildGoogleCalendarUrl, downloadIcsFile } from '../utils/calendarExport';
import {
  formatCurrency,
  formatFullDate,
  formatShortDate,
  getReminderWindowMetrics,
} from '../utils/dateRange';

interface ReminderCardProps {
  reminder: Reminder;
  onToggleComplete: (id: string) => void;
  onAdvanceCycle: (id: string) => void;
  onEdit: (reminder: Reminder) => void;
  onDelete: (reminder: Reminder) => void;
  onMarkCalendarSynced: (id: string) => void;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({
  reminder,
  onToggleComplete,
  onAdvanceCycle,
  onEdit,
  onDelete,
  onMarkCalendarSynced,
}) => {
  const metrics = getReminderWindowMetrics(reminder);
  const amountLabel = formatCurrency(reminder.amount, reminder.currency);
  const googleCalUrl = buildGoogleCalendarUrl(reminder);

  const statusTextColor =
    metrics.status === 'completed'
      ? 'text-emerald-700'
      : metrics.status === 'overdue'
        ? 'text-rose-700'
        : metrics.status === 'due_soon'
          ? 'text-amber-700'
          : metrics.status === 'upcoming'
            ? 'text-slate-600'
            : 'text-teal-700';

  const barFillColor =
    metrics.status === 'completed'
      ? 'bg-emerald-600'
      : metrics.status === 'overdue'
        ? 'bg-rose-600'
        : metrics.status === 'due_soon'
          ? 'bg-amber-600'
          : 'bg-teal-700';

  return (
    <article className="rounded-2xl border border-slate-200/90 bg-white p-4 transition-colors hover:border-slate-300 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
            <span className="font-medium text-slate-700">
              {CATEGORY_LABELS[reminder.category]}
            </span>
            <span aria-hidden="true">·</span>
            <span>{reminder.provider}</span>
            {reminder.accountRef && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono-nums">{reminder.accountRef}</span>
              </>
            )}
          </div>

          <h3
            className={`mt-1 text-base font-semibold tracking-tight sm:text-lg ${
              reminder.completed ? 'text-slate-400 line-through' : 'text-slate-900'
            }`}
          >
            {reminder.title}
          </h3>
        </div>

        <div className="shrink-0 text-right">
          {amountLabel && (
            <p className="text-base font-bold text-slate-900 font-mono-nums sm:text-lg">
              {amountLabel}
            </p>
          )}
          <p className={`text-xs font-semibold font-mono-nums ${statusTextColor}`}>
            {metrics.statusLabel}
          </p>
        </div>
      </div>

      {/* Date Range Window & Progress */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-mono-nums">
            {formatShortDate(reminder.startDate)} — {formatFullDate(reminder.endDate)}
          </span>
          <span className="font-mono-nums text-slate-500">
            {metrics.totalDays}d window
          </span>
        </div>

        <div
          className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuenow={metrics.progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Window progress: ${metrics.progressPercent}%`}
        >
          <div
            className={`h-full rounded-full transition-all duration-300 ${barFillColor}`}
            style={{ width: `${metrics.progressPercent}%` }}
          />
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="inline-flex items-center gap-1">
              <Bell className="h-3.5 w-3.5 text-slate-400" />
              {reminder.notifyDaysBefore.length > 0
                ? `Alerts: ${reminder.notifyDaysBefore
                    .map((d) => (d === 0 ? 'due day' : `${d}d prior`))
                    .join(', ')}`
                : 'No lead alerts'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{RECURRENCE_LABELS[reminder.recurrence]}</span>
          </div>

          {reminder.calendarSyncedAt && (
            <span className="text-teal-700 font-medium">
              Exported {new Date(reminder.calendarSyncedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {reminder.notes && (
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{reminder.notes}</p>
      )}

      {/* Action Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onToggleComplete(reminder.id)}
            className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition whitespace-nowrap shrink-0 ${
              reminder.completed
                ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {reminder.completed ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Completed
              </>
            ) : (
              <>
                <Circle className="h-4 w-4" />
                Mark Paid / Done
              </>
            )}
          </button>

          {reminder.completed && reminder.recurrence !== 'none' && (
            <button
              type="button"
              onClick={() => onAdvanceCycle(reminder.id)}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-800 transition hover:bg-teal-100 whitespace-nowrap shrink-0"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Next Cycle
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <a
            href={googleCalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onMarkCalendarSynced(reminder.id)}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 whitespace-nowrap shrink-0"
            title="Open in Google Calendar"
          >
            <CalendarPlus className="h-3.5 w-3.5 text-teal-700" />
            <span>Google Calendar</span>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </a>

          <button
            type="button"
            onClick={() => {
              downloadIcsFile([reminder], `${reminder.title.toLowerCase().replace(/\s+/g, '-')}.ics`);
              onMarkCalendarSynced(reminder.id);
            }}
            className="inline-flex min-h-[40px] items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 whitespace-nowrap shrink-0"
            title="Download .ics calendar file"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>.ics</span>
          </button>

          <button
            type="button"
            onClick={() => onEdit(reminder)}
            className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label={`Edit ${reminder.title}`}
            title="Edit reminder"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(reminder)}
            className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"
            aria-label={`Delete ${reminder.title}`}
            title="Delete reminder"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
};
