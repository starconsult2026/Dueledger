import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BellRing, CalendarRange, Plus } from 'lucide-react';
import { BottomNav } from './components/BottomNav';
import { ConfirmModal } from './components/ConfirmModal';
import { DateRangeFilterBar } from './components/DateRangeFilterBar';
import { DateRangeTimeline } from './components/DateRangeTimeline';
import { NotificationCenter } from './components/NotificationCenter';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { ReminderCard } from './components/ReminderCard';
import { ReminderFormModal } from './components/ReminderFormModal';
import { SettingsView } from './components/SettingsView';
import { SummaryStrip } from './components/SummaryStrip';
import { TopBar } from './components/TopBar';
import {
  ActiveTab,
  AppSettings,
  DateRangePreset,
  NotificationLogItem,
  Reminder,
  ServiceCategory,
} from './types/reminder';
import {
  addDaysToDateString,
  advanceDateByRecurrence,
  getReminderWindowMetrics,
  overlapsDateRange,
  toLocalDateString,
} from './utils/dateRange';
import {
  dispatchLocalPushNotification,
  evaluateAndDispatchAlerts,
  getNotificationPermission,
  PermissionState,
  requestNotificationPermission,
} from './utils/notifications';
import {
  createStarterReminders,
  DEFAULT_SETTINGS,
  loadAppState,
  saveNotificationLogs,
  saveReminders,
  saveSettings,
} from './utils/storage';

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [logs, setLogs] = useState<NotificationLogItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [permission, setPermission] = useState<PermissionState>(() =>
    getNotificationPermission()
  );

  const [activeTab, setActiveTab] = useState<ActiveTab>('reminders');
  const [preset, setPreset] = useState<DateRangePreset>('all');
  const [customStart, setCustomStart] = useState(() =>
    toLocalDateString(new Date())
  );
  const [customEnd, setCustomEnd] = useState(() =>
    addDaysToDateString(toLocalDateString(new Date()), 14)
  );
  const [category, setCategory] = useState<ServiceCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    destructive?: boolean;
    action: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    confirmLabel: 'Confirm',
    action: () => {},
  });

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(t);
  }, [toastMessage]);

  useEffect(() => {
    let mounted = true;
    loadAppState().then((state) => {
      if (!mounted) return;
      setReminders(state.reminders);
      setLogs(state.logs);
      setSettings(state.settings);
      setLoaded(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const persistReminders = useCallback((next: Reminder[]) => {
    setReminders(next);
    void saveReminders(next);
  }, []);

  const persistLogs = useCallback((next: NotificationLogItem[]) => {
    setLogs(next);
    void saveNotificationLogs(next);
  }, []);

  const persistSettings = useCallback((next: AppSettings) => {
    setSettings(next);
    void saveSettings(next);
  }, []);

  const runWindowNotificationCheck = useCallback(
    async (silent = false) => {
      if (getNotificationPermission() !== 'granted') {
        if (!silent) {
          showToast('Enable push notifications first to receive device alerts.');
        }
        return;
      }
      const triggered = await evaluateAndDispatchAlerts(
        reminders,
        logs,
        settings.pushEnabled
      );
      if (triggered.length > 0) {
        const updatedLogs = [...triggered, ...logs];
        persistLogs(updatedLogs);
        if (!silent) {
          showToast(`Sent ${triggered.length} reminder alert(s).`);
        }
      } else if (!silent) {
        showToast('All active windows checked. No new alerts due today.');
      }
    },
    [reminders, logs, settings.pushEnabled, persistLogs, showToast]
  );

  useEffect(() => {
    if (!loaded || !settings.autoCheckOnLaunch) return;
    if (permission === 'granted' && settings.pushEnabled) {
      void runWindowNotificationCheck(true);
    }
    const interval = setInterval(() => {
      if (getNotificationPermission() === 'granted' && settings.pushEnabled) {
        void runWindowNotificationCheck(true);
      }
    }, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loaded, permission, settings.autoCheckOnLaunch, settings.pushEnabled, runWindowNotificationCheck]);

  const handleRequestPermission = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === 'granted') {
      showToast('Push notifications enabled for this device.');
    } else if (result === 'denied') {
      showToast('Notifications blocked. Please allow them in browser settings.');
    }
  };

  const handleSendTestNotification = async () => {
    const ok = await dispatchLocalPushNotification(
      'DueLedger Push Test',
      'Push notifications are working for your bank & service date windows.',
      `test-${Date.now()}`
    );
    if (ok) {
      const item: NotificationLogItem = {
        id: `test-${Date.now()}`,
        reminderId: 'manual-test',
        title: 'DueLedger Push Test',
        body: 'Push notifications are working for your bank & service date windows.',
        sentAt: new Date().toISOString(),
        dateKey: toLocalDateString(new Date()),
        triggerType: 'manual_test',
      };
      persistLogs([item, ...logs]);
      showToast('Test push notification sent.');
    } else {
      showToast('Unable to send notification. Check device permissions.');
    }
  };

  const handleSaveReminder = (
    data: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt' | 'completed'>
  ) => {
    const now = new Date().toISOString();
    if (editingReminder) {
      const next = reminders.map((r) =>
        r.id === editingReminder.id
          ? { ...r, ...data, updatedAt: now }
          : r
      );
      persistReminders(next);
      showToast('Reminder updated.');
    } else {
      const created: Reminder = {
        ...data,
        id: `rem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        completed: false,
        createdAt: now,
        updatedAt: now,
      };
      persistReminders([created, ...reminders]);
      showToast('Bank & service reminder saved.');
    }
    setFormOpen(false);
    setEditingReminder(null);
  };

  const handleToggleComplete = (id: string) => {
    const now = new Date().toISOString();
    const next = reminders.map((r) => {
      if (r.id !== id) return r;
      const completed = !r.completed;
      return {
        ...r,
        completed,
        completedAt: completed ? now : undefined,
        updatedAt: now,
      };
    });
    persistReminders(next);
  };

  const handleAdvanceCycle = (id: string) => {
    const now = new Date().toISOString();
    const next = reminders.map((r) => {
      if (r.id !== id || r.recurrence === 'none') return r;
      return {
        ...r,
        startDate: advanceDateByRecurrence(r.startDate, r.recurrence),
        endDate: advanceDateByRecurrence(r.endDate, r.recurrence),
        completed: false,
        completedAt: undefined,
        updatedAt: now,
      };
    });
    persistReminders(next);
    showToast('Advanced reminder to next recurring date window.');
  };

  const handleDeletePrompt = (reminder: Reminder) => {
    setConfirmState({
      open: true,
      title: `Delete "${reminder.title}"?`,
      description: `This removes the ${reminder.provider} reminder (${reminder.startDate} to ${reminder.endDate}) from your device.`,
      confirmLabel: 'Delete Reminder',
      destructive: true,
      action: () => {
        persistReminders(reminders.filter((r) => r.id !== reminder.id));
        setConfirmState((prev) => ({ ...prev, open: false }));
        showToast('Reminder deleted.');
      },
    });
  };

  const handleMarkCalendarSynced = (id: string) => {
    const now = new Date().toISOString();
    persistReminders(
      reminders.map((r) => (r.id === id ? { ...r, calendarSyncedAt: now } : r))
    );
  };

  const filteredReminders = useMemo(() => {
    const today = toLocalDateString(new Date());
    const next7 = addDaysToDateString(today, 7);
    const nowDate = new Date();
    const monthStart = toLocalDateString(
      new Date(nowDate.getFullYear(), nowDate.getMonth(), 1)
    );
    const monthEnd = toLocalDateString(
      new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, 0)
    );

    const q = searchQuery.trim().toLowerCase();

    return reminders
      .filter((r) => {
        if (!showCompleted && r.completed) return false;
        if (category !== 'all' && r.category !== category) return false;
        if (
          q &&
          !r.title.toLowerCase().includes(q) &&
          !r.provider.toLowerCase().includes(q) &&
          !(r.accountRef || '').toLowerCase().includes(q)
        ) {
          return false;
        }

        if (preset === 'active_now') {
          return overlapsDateRange(r, today, today);
        }
        if (preset === 'next_7_days') {
          return overlapsDateRange(r, today, next7);
        }
        if (preset === 'this_month') {
          return overlapsDateRange(r, monthStart, monthEnd);
        }
        if (preset === 'custom') {
          return overlapsDateRange(r, customStart, customEnd);
        }
        return true;
      })
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return a.endDate.localeCompare(b.endDate);
      });
  }, [
    reminders,
    showCompleted,
    category,
    searchQuery,
    preset,
    customStart,
    customEnd,
  ]);

  const urgentCount = useMemo(() => {
    return reminders.filter((r) => {
      if (r.completed) return false;
      const status = getReminderWindowMetrics(r).status;
      return status === 'overdue' || status === 'due_soon';
    }).length;
  }, [reminders]);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 text-slate-900 md:pb-12">
      <TopBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreateNew={() => {
          setEditingReminder(null);
          setFormOpen(true);
        }}
      />

      <main className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8 lg:pt-8">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
          {/* Desktop Left Rail */}
          <aside className="hidden space-y-4 lg:col-span-3 lg:block">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 font-display text-balance">
                Bank & Service Windows
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                Track statement windows, deposit maturities, EMI schedules, and service renewals across custom date ranges.
              </p>

              <div className="mt-4 flex flex-col gap-2">
                <PWAInstallButton variant="card" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <BellRing className="h-4 w-4 text-teal-700" />
                <span>Push Alerts</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                {permission === 'granted'
                  ? 'Device notifications are active for approaching end dates.'
                  : 'Allow push notifications to receive alerts before windows close.'}
              </p>
              {permission !== 'granted' && permission !== 'unsupported' ? (
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="mt-3 min-h-[40px] w-full rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                >
                  Enable Device Alerts
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab('alerts')}
                  className="mt-3 min-h-[40px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Manage Alert Rules
                </button>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <CalendarRange className="h-4 w-4 text-teal-700" />
                <span>Google Calendar Sync</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Use the Google Calendar or .ics button on any reminder, or batch-export an entire date range from the Date Range tab.
              </p>
            </div>
          </aside>

          {/* Main Workspace */}
          <div className="space-y-5 lg:col-span-9">
            {activeTab === 'reminders' && (
              <>
                <div className="flex items-center justify-between lg:hidden">
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 font-display">
                      Bank & Service Windows
                    </h1>
                    <p className="text-xs text-slate-600">
                      Date-range reminders with push alerts & calendar export
                    </p>
                  </div>
                </div>

                {permission === 'default' && (
                  <div className="flex flex-col gap-3 rounded-2xl border border-teal-200 bg-teal-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Enable push notifications on this device
                        </p>
                        <p className="text-xs text-slate-600">
                          Get notified when bank payment windows open or approach their due date.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRequestPermission}
                      className="min-h-[42px] rounded-xl bg-teal-700 px-4 py-2 text-xs font-medium text-white hover:bg-teal-800 whitespace-nowrap shrink-0"
                    >
                      Enable Notifications
                    </button>
                  </div>
                )}

                <SummaryStrip reminders={reminders} />

                <DateRangeFilterBar
                  preset={preset}
                  onPresetChange={setPreset}
                  customStart={customStart}
                  customEnd={customEnd}
                  onCustomStartChange={setCustomStart}
                  onCustomEndChange={setCustomEnd}
                  category={category}
                  onCategoryChange={setCategory}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  showCompleted={showCompleted}
                  onToggleShowCompleted={() => setShowCompleted((s) => !s)}
                />

                {!loaded ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                    Loading local reminders...
                  </div>
                ) : filteredReminders.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                    <p className="text-base font-semibold text-slate-900">
                      No reminders match this date range or filter
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Adjust your date window filters or add a new personal bank or service reminder.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingReminder(null);
                        setFormOpen(true);
                      }}
                      className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
                    >
                      <Plus className="h-4 w-4" />
                      Add Reminder
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredReminders.map((reminder) => (
                      <ReminderCard
                        key={reminder.id}
                        reminder={reminder}
                        onToggleComplete={handleToggleComplete}
                        onAdvanceCycle={handleAdvanceCycle}
                        onEdit={(r) => {
                          setEditingReminder(r);
                          setFormOpen(true);
                        }}
                        onDelete={handleDeletePrompt}
                        onMarkCalendarSynced={handleMarkCalendarSynced}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'timeline' && (
              <DateRangeTimeline
                reminders={reminders}
                onEdit={(r) => {
                  setEditingReminder(r);
                  setFormOpen(true);
                }}
                onMarkCalendarSynced={handleMarkCalendarSynced}
              />
            )}

            {activeTab === 'alerts' && (
              <NotificationCenter
                permission={permission}
                pushEnabled={settings.pushEnabled}
                reminders={reminders}
                logs={logs}
                onRequestPermission={handleRequestPermission}
                onTogglePushEnabled={() =>
                  persistSettings({
                    ...settings,
                    pushEnabled: !settings.pushEnabled,
                  })
                }
                onSendTestNotification={handleSendTestNotification}
                onRunWindowCheck={() => void runWindowNotificationCheck(false)}
                onClearLogs={() => persistLogs([])}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                settings={settings}
                reminders={reminders}
                onUpdateSettings={persistSettings}
                onResetDemoData={() => {
                  setConfirmState({
                    open: true,
                    title: 'Restore sample bank & service reminders?',
                    description:
                      'This replaces your current reminder list with the default bank and utility window examples.',
                    confirmLabel: 'Restore Samples',
                    destructive: false,
                    action: () => {
                      persistReminders(createStarterReminders());
                      setConfirmState((prev) => ({ ...prev, open: false }));
                      showToast('Sample reminders restored.');
                    },
                  });
                }}
                onClearAllReminders={() => {
                  setConfirmState({
                    open: true,
                    title: 'Clear all reminders?',
                    description:
                      'This permanently deletes all saved reminders from this device. Export a .ics backup first if needed.',
                    confirmLabel: 'Clear Everything',
                    destructive: true,
                    action: () => {
                      persistReminders([]);
                      setConfirmState((prev) => ({ ...prev, open: false }));
                      showToast('All reminders cleared.');
                    },
                  });
                }}
              />
            )}
          </div>
        </div>
      </main>

      {/* Mobile Floating Action Button in natural thumb reach */}
      <button
        type="button"
        onClick={() => {
          setEditingReminder(null);
          setFormOpen(true);
        }}
        aria-label="New reminder"
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-lg shadow-teal-900/20 transition active:scale-95 md:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>

      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        urgentCount={urgentCount}
      />

      <ReminderFormModal
        open={formOpen}
        initialReminder={editingReminder}
        defaultCurrency={settings.defaultCurrency}
        defaultLeadDays={settings.defaultLeadDays}
        onClose={() => {
          setFormOpen(false);
          setEditingReminder(null);
        }}
        onSave={handleSaveReminder}
      />

      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        description={confirmState.description}
        confirmLabel={confirmState.confirmLabel}
        destructive={confirmState.destructive}
        onConfirm={confirmState.action}
        onCancel={() => setConfirmState((prev) => ({ ...prev, open: false }))}
      />

      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-medium text-white shadow-lg md:bottom-6"
        >
          {toastMessage}
        </div>
      )}

      <OfflineIndicator />
    </div>
  );
}
