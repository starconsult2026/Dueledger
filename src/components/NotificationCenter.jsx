import React from 'react';
import { Bell, BellOff, BellRing, CheckCircle2, RefreshCw } from 'lucide-react';
import { formatFullDate, getReminderWindowMetrics } from '../utils/dateRange';

export const NotificationCenter = ({
  permission,
  pushEnabled,
  reminders,
  logs,
  onRequestPermission,
  onTogglePushEnabled,
  onSendTestNotification,
  onRunWindowCheck,
  onClearLogs,
}) => {
  const upcomingAlerts = reminders
    .filter((r) => !r.completed)
    .map((r) => ({ reminder: r, metrics: getReminderWindowMetrics(r) }))
    .sort((a, b) => a.metrics.daysRemaining - b.metrics.daysRemaining)
    .slice(0, 6);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 font-display">
              Android & Browser Push Notifications
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Receive device alerts when a bank or service window opens, approaches its closing date, or becomes due.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {permission !== 'granted' && permission !== 'unsupported' && (
              <button
                type="button"
                onClick={onRequestPermission}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 whitespace-nowrap"
              >
                <BellRing className="h-4 w-4" />
                Allow Push Notifications
              </button>
            )}

            <button
              type="button"
              onClick={onSendTestNotification}
              disabled={permission !== 'granted'}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
            >
              <Bell className="h-4 w-4 text-teal-700" />
              Send Test Notification
            </button>

            <button
              type="button"
              onClick={onRunWindowCheck}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              <RefreshCw className="h-4 w-4" />
              Check Active Windows
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm">
          <div className="flex items-center gap-2">
            {permission === 'granted' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            ) : (
              <BellOff className="h-4 w-4 text-amber-700" />
            )}
            <span className="font-medium text-slate-800">
              Device Permission:{' '}
              {permission === 'granted'
                ? 'Enabled'
                : permission === 'denied'
                  ? 'Blocked in browser settings'
                  : permission === 'unsupported'
                    ? 'Not supported in this browser'
                    : 'Not granted yet'}
            </span>
          </div>

          <button
            type="button"
            onClick={onTogglePushEnabled}
            className={`min-h-[40px] rounded-xl border px-3.5 py-1.5 text-xs font-medium transition whitespace-nowrap ${
              pushEnabled
                ? 'border-teal-700 bg-teal-50 text-teal-800'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            {pushEnabled ? 'Window Alerts Active' : 'Window Alerts Paused'}
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5">
          <h3 className="text-base font-semibold text-slate-900">
            Upcoming Alert Schedule
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Active and upcoming reminders prioritized by window closing date.
          </p>

          {upcomingAlerts.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No pending reminders scheduled.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {upcomingAlerts.map(({ reminder, metrics }) => (
                <li key={reminder.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {reminder.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {reminder.provider} · Ends {formatFullDate(reminder.endDate)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-semibold font-mono-nums ${
                      metrics.status === 'overdue'
                        ? 'text-rose-700'
                        : metrics.status === 'due_soon'
                          ? 'text-amber-700'
                          : 'text-teal-700'
                    }`}
                  >
                    {metrics.statusLabel}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200/90 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Dispatched Alert History
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Recent notifications delivered to this device.
              </p>
            </div>
            {logs.length > 0 && (
              <button
                type="button"
                onClick={onClearLogs}
                className="min-h-[36px] rounded-lg px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Clear History
              </button>
            )}
          </div>

          {logs.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No notifications dispatched yet. Allow notifications and send a test alert above.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {logs.slice(0, 12).map((log) => (
                <li key={log.id} className="py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900">{log.title}</p>
                    <span className="shrink-0 text-xs text-slate-400 font-mono-nums">
                      {new Date(log.sentAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-600">{log.body}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};
