import React from 'react';
import { getReminderWindowMetrics } from '../utils/dateRange';

export const SummaryStrip = ({ reminders }) => {
  const metricsList = reminders.map((r) => getReminderWindowMetrics(r));

  const activeCount = metricsList.filter((m) => m.status === 'active').length;
  const dueSoonCount = metricsList.filter((m) => m.status === 'due_soon').length;
  const overdueCount = metricsList.filter((m) => m.status === 'overdue').length;
  const completedCount = metricsList.filter((m) => m.status === 'completed').length;

  const items = [
    {
      label: 'Active Windows',
      value: activeCount,
      sub: 'Open now',
      accentClass: 'text-teal-700',
    },
    {
      label: 'Due Within 3d',
      value: dueSoonCount,
      sub: 'Action needed',
      accentClass: dueSoonCount > 0 ? 'text-amber-700' : 'text-slate-900',
    },
    {
      label: 'Overdue',
      value: overdueCount,
      sub: 'Past end date',
      accentClass: overdueCount > 0 ? 'text-rose-700' : 'text-slate-900',
    },
    {
      label: 'Completed',
      value: completedCount,
      sub: 'Settled items',
      accentClass: 'text-emerald-700',
    },
  ];

  return (
    <section
      aria-label="Reminder summary"
      className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-slate-200/90 bg-white p-4"
        >
          <p className="text-xs font-medium text-slate-500">{item.label}</p>
          <p className={`mt-1 text-2xl font-bold font-mono-nums ${item.accentClass}`}>
            {item.value}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{item.sub}</p>
        </div>
      ))}
    </section>
  );
};
