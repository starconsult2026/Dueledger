import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { BottomNav } from './components/BottomNav';
import { ConfirmModal } from './components/ConfirmModal';
import { DateRangeFilterBar } from './components/DateRangeFilterBar';
import { DateRangeTimeline } from './components/DateRangeTimeline';
import {
  type CategoryFilter,
  ListSearchAndCategoryBar,
} from './components/ListSearchAndCategoryBar';
import { NotificationCenter } from './components/NotificationCenter';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { ReminderCard } from './components/ReminderCard';
import { ReminderFormModal } from './components/ReminderFormModal';
import { BellIcon, CalendarIcon, PlusIcon } from './components/RNIcons';
import { SettingsView } from './components/SettingsView';
import { SummaryStrip } from './components/SummaryStrip';
import { TopBar } from './components/TopBar';
import { CATEGORY_LABELS } from './constants/reminder';
import { COLORS, FONTS } from './theme/tokens';
import type {
  AppSettings,
  AppTab,
  DateRangePreset,
  NotificationLog,
  NotificationPermissionState,
  Reminder,
  ReminderInput,
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
  getNotificationPermissionAsync,
  requestNotificationPermission,
  syncScheduledReminderNotifications,
} from './utils/notifications';
import {
  createStarterReminders,
  DEFAULT_SETTINGS,
  loadAppState,
  saveNotificationLogs,
  saveReminders,
  saveSettings,
} from './utils/storage';

interface ConfirmState {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  destructive: boolean;
  action: () => void;
}

export default function App(): React.ReactElement {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTabletOrUp = width >= 768;

  const [loaded, setLoaded] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [permission, setPermission] = useState<NotificationPermissionState>(() =>
    getNotificationPermission()
  );

  const [activeTab, setActiveTab] = useState<AppTab>('reminders');
  const [preset, setPreset] = useState<DateRangePreset>('all');
  const [customStart, setCustomStart] = useState(() =>
    toLocalDateString(new Date())
  );
  const [customEnd, setCustomEnd] = useState(() =>
    addDaysToDateString(toLocalDateString(new Date()), 14)
  );
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    title: '',
    description: '',
    confirmLabel: 'Confirm',
    destructive: false,
    action: () => {},
  });

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return undefined;
    const t = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(t);
  }, [toastMessage]);

  useEffect(() => {
    let mounted = true;
    void Promise.all([loadAppState(), getNotificationPermissionAsync()]).then(
      ([state, currentPermission]) => {
        if (!mounted) return;
        setReminders(state.reminders);
        setLogs(state.logs);
        setSettings(state.settings);
        setPermission(currentPermission);
        setLoaded(true);
      }
    );
    return () => {
      mounted = false;
    };
  }, []);

  const persistReminders = useCallback((next: Reminder[]) => {
    setReminders(next);
    void saveReminders(next);
  }, []);

  const persistLogs = useCallback((next: NotificationLog[]) => {
    setLogs(next);
    void saveNotificationLogs(next);
  }, []);

  const persistSettings = useCallback((next: AppSettings) => {
    setSettings(next);
    void saveSettings(next);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    void syncScheduledReminderNotifications(reminders, settings.pushEnabled);
  }, [loaded, reminders, settings.pushEnabled, permission]);

  const runWindowNotificationCheck = useCallback(
    async (silent = false) => {
      const currentPerm = await getNotificationPermissionAsync();
      if (currentPerm !== 'granted') {
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
    if (!loaded || !settings.autoCheckOnLaunch) return undefined;
    if (permission === 'granted' && settings.pushEnabled) {
      void runWindowNotificationCheck(true);
    }
    const interval = setInterval(() => {
      void getNotificationPermissionAsync().then((currentPerm) => {
        if (currentPerm === 'granted' && settings.pushEnabled) {
          void runWindowNotificationCheck(true);
        }
      });
    }, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [
    loaded,
    permission,
    settings.autoCheckOnLaunch,
    settings.pushEnabled,
    runWindowNotificationCheck,
  ]);

  const handleRequestPermission = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === 'granted') {
      showToast('Push notifications enabled for this device.');
    } else if (result === 'denied') {
      showToast(
        'Notifications blocked. Please allow them in browser settings.'
      );
    }
  };

  const handleSendTestNotification = async () => {
    const ok = await dispatchLocalPushNotification(
      'DueLedger Push Test',
      'Push notifications are working for your bank & service date windows.',
      `test-${Date.now()}`
    );
    if (ok) {
      const item: NotificationLog = {
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

  const handleSaveReminder = (data: ReminderInput) => {
    const now = new Date().toISOString();
    if (editingReminder) {
      const next = reminders.map((r) =>
        r.id === editingReminder.id ? { ...r, ...data, updatedAt: now } : r
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
          !(r.accountRef || '').toLowerCase().includes(q) &&
          !(CATEGORY_LABELS[r.category] || '').toLowerCase().includes(q)
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

  const { categoryCounts, visibleBaseCount } = useMemo(() => {
    const counts: Partial<Record<ServiceCategory, number>> = {};
    let total = 0;
    const q = searchQuery.trim().toLowerCase();
    for (const r of reminders) {
      if (!showCompleted && r.completed) continue;
      if (
        q &&
        !r.title.toLowerCase().includes(q) &&
        !r.provider.toLowerCase().includes(q) &&
        !(r.accountRef || '').toLowerCase().includes(q) &&
        !(CATEGORY_LABELS[r.category] || '').toLowerCase().includes(q)
      ) {
        continue;
      }
      total += 1;
      counts[r.category] = (counts[r.category] || 0) + 1;
    }
    return { categoryCounts: counts, visibleBaseCount: total };
  }, [reminders, showCompleted, searchQuery]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 || category !== 'all' || preset !== 'all';

  const urgentCount = useMemo(() => {
    return reminders.filter((r) => {
      if (r.completed) return false;
      const status = getReminderWindowMetrics(r).status;
      return status === 'overdue' || status === 'due_soon';
    }).length;
  }, [reminders]);

  return (
    <SafeAreaView style={styles.safeRoot}>
      <TopBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreateNew={() => {
          setEditingReminder(null);
          setFormOpen(true);
        }}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          !isTabletOrUp && styles.scrollContentMobile,
        ]}
      >
        <View style={[styles.workspace, isDesktop && styles.workspaceDesktop]}>
          {isDesktop && (
            <View style={styles.sidebar}>
              <View style={styles.sideCard}>
                <Text style={styles.sideHeading}>Bank & Service Windows</Text>
                <Text style={styles.sideBody}>
                  Track statement windows, deposit maturities, EMI schedules, and service renewals across custom date ranges.
                </Text>
                <View style={styles.sideAction}>
                  <PWAInstallButton variant="card" />
                </View>
              </View>

              <View style={styles.sideCard}>
                <View style={styles.sideTitleRow}>
                  <BellIcon size={15} color={COLORS.teal} />
                  <Text style={styles.sideTitle}>Push Alerts</Text>
                </View>
                <Text style={styles.sideSmall}>
                  {permission === 'granted'
                    ? 'Device notifications are active for approaching end dates.'
                    : 'Allow push notifications to receive alerts before windows close.'}
                </Text>
                {permission !== 'granted' && permission !== 'unsupported' ? (
                  <Pressable
                    onPress={() => {
                      void handleRequestPermission();
                    }}
                    style={styles.sideDarkBtn}
                  >
                    <Text style={styles.sideDarkBtnText}>
                      Enable Device Alerts
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => setActiveTab('alerts')}
                    style={styles.sideOutlineBtn}
                  >
                    <Text style={styles.sideOutlineBtnText}>
                      Manage Alert Rules
                    </Text>
                  </Pressable>
                )}
              </View>

              <View style={styles.sideCard}>
                <View style={styles.sideTitleRow}>
                  <CalendarIcon size={15} color={COLORS.teal} />
                  <Text style={styles.sideTitle}>Google Calendar Sync</Text>
                </View>
                <Text style={styles.sideSmall}>
                  Use Google Calendar or .ics export on any reminder, or export an entire date range from the Date Range tab.
                </Text>
              </View>
            </View>
          )}

          <View style={styles.mainCol}>
            {activeTab === 'reminders' && (
              <View style={styles.sectionStack}>
                {!isDesktop && (
                  <View>
                    <Text style={styles.mobileHeading}>
                      Bank & Service Windows
                    </Text>
                    <Text style={styles.mobileSub}>
                      Date-range reminders with push alerts & calendar export
                    </Text>
                  </View>
                )}

                {permission === 'default' && (
                  <View style={styles.permBanner}>
                    <View style={styles.permInfo}>
                      <BellIcon size={18} color={COLORS.teal} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.permTitle}>
                          Enable push notifications on this device
                        </Text>
                        <Text style={styles.permSub}>
                          Get notified when bank payment windows open or approach their due date.
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      onPress={() => {
                        void handleRequestPermission();
                      }}
                      style={styles.permBtn}
                    >
                      <Text style={styles.permBtnText}>
                        Enable Notifications
                      </Text>
                    </Pressable>
                  </View>
                )}

                <ListSearchAndCategoryBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  category={category}
                  onCategoryChange={setCategory}
                  categoryCounts={categoryCounts}
                  totalCount={visibleBaseCount}
                />

                <SummaryStrip reminders={reminders} />

                <DateRangeFilterBar
                  preset={preset}
                  onPresetChange={setPreset}
                  customStart={customStart}
                  customEnd={customEnd}
                  onCustomStartChange={setCustomStart}
                  onCustomEndChange={setCustomEnd}
                  showCompleted={showCompleted}
                  onToggleShowCompleted={() => setShowCompleted((s) => !s)}
                />

                {hasActiveFilters && (
                  <View style={styles.filterStatusRow}>
                    <Text style={styles.filterStatusText}>
                      Showing {filteredReminders.length} of {visibleBaseCount}{' '}
                      matching reminder{visibleBaseCount === 1 ? '' : 's'}
                    </Text>
                    <Pressable
                      onPress={() => {
                        setSearchQuery('');
                        setCategory('all');
                        setPreset('all');
                      }}
                      accessibilityRole="button"
                      style={styles.resetFilterBtn}
                    >
                      <Text style={styles.resetFilterText}>Reset filters</Text>
                    </Pressable>
                  </View>
                )}

                {!loaded ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptySub}>
                      Loading local reminders...
                    </Text>
                  </View>
                ) : filteredReminders.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>
                      No reminders match this date range or filter
                    </Text>
                    <Text style={styles.emptySub}>
                      Adjust your date window filters or add a new personal bank or service reminder.
                    </Text>
                    <Pressable
                      onPress={() => {
                        setEditingReminder(null);
                        setFormOpen(true);
                      }}
                      style={styles.emptyBtn}
                    >
                      <PlusIcon size={15} color={COLORS.white} />
                      <Text style={styles.emptyBtnText}>Add Reminder</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.cardsList}>
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
                  </View>
                )}
              </View>
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
                onRequestPermission={() => {
                  void handleRequestPermission();
                }}
                onTogglePushEnabled={() =>
                  persistSettings({
                    ...settings,
                    pushEnabled: !settings.pushEnabled,
                  })
                }
                onSendTestNotification={() => {
                  void handleSendTestNotification();
                }}
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
          </View>
        </View>
      </ScrollView>

      {!isTabletOrUp && (
        <Pressable
          onPress={() => {
            setEditingReminder(null);
            setFormOpen(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="New reminder"
          style={styles.fab}
        >
          <PlusIcon size={22} color={COLORS.white} />
        </Pressable>
      )}

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

      {!!toastMessage && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      <OfflineIndicator />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeRoot: {
    flex: 1,
    minHeight: '100%',
    backgroundColor: COLORS.bgCanvas,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    width: '100%',
    maxWidth: 1240,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 48,
  },
  scrollContentMobile: {
    paddingBottom: 96,
  },
  workspace: {
    gap: 20,
  },
  workspaceDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sidebar: {
    width: 280,
    gap: 14,
  },
  sideCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    gap: 8,
  },
  sideHeading: {
    fontFamily: FONTS.display,
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.inkPrimary,
  },
  sideBody: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.inkSecondary,
  },
  sideAction: {
    marginTop: 6,
  },
  sideTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sideTitle: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.inkPrimary,
  },
  sideSmall: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.inkSecondary,
  },
  sideDarkBtn: {
    marginTop: 6,
    minHeight: 40,
    borderRadius: 10,
    backgroundColor: COLORS.inkPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideDarkBtnText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  sideOutlineBtn: {
    marginTop: 6,
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideOutlineBtnText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.inkSecondary,
  },
  mainCol: {
    flex: 1,
  },
  sectionStack: {
    gap: 16,
  },
  mobileHeading: {
    fontFamily: FONTS.display,
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.inkPrimary,
  },
  mobileSub: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    color: COLORS.inkSecondary,
  },
  permBanner: {
    backgroundColor: COLORS.tealBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.tealBorder,
    padding: 14,
    gap: 12,
  },
  permInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  permTitle: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.inkPrimary,
  },
  permSub: {
    marginTop: 2,
    fontFamily: FONTS.sans,
    fontSize: 12,
    color: COLORS.inkSecondary,
  },
  permBtn: {
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.teal,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  permBtnText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontFamily: FONTS.display,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.inkPrimary,
    textAlign: 'center',
  },
  emptySub: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    color: COLORS.inkSecondary,
    textAlign: 'center',
  },
  emptyBtn: {
    marginTop: 8,
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.teal,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyBtnText: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  filterStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  filterStatusText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.inkSecondary,
  },
  resetFilterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceMuted,
  },
  resetFilterText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.tealDark,
  },
  cardsList: {
    gap: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  toast: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: COLORS.inkPrimary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  toastText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
});
