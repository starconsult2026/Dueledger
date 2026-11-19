import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS } from '../theme/tokens';
import { formatFullDate, getReminderWindowMetrics } from '../utils/dateRange';
import { BellIcon, GlyphIcon } from './RNIcons';

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
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Android & Browser Push Notifications</Text>
            <Text style={styles.subtitle}>
              Receive device alerts when a bank or service window opens, approaches its closing date, or becomes due.
            </Text>
          </View>

          <View style={styles.btnRow}>
            {permission !== 'granted' && permission !== 'unsupported' && (
              <Pressable onPress={onRequestPermission} style={styles.primaryBtn}>
                <BellIcon size={15} color={COLORS.white} />
                <Text style={styles.primaryBtnText}>Allow Push Notifications</Text>
              </Pressable>
            )}

            <Pressable
              onPress={onSendTestNotification}
              disabled={permission !== 'granted'}
              style={[
                styles.secondaryBtn,
                permission !== 'granted' && styles.disabledBtn,
              ]}
            >
              <BellIcon size={15} color={COLORS.teal} />
              <Text style={styles.secondaryBtnText}>Send Test Notification</Text>
            </Pressable>

            <Pressable onPress={onRunWindowCheck} style={styles.secondaryBtn}>
              <GlyphIcon symbol="↻" size={14} color={COLORS.inkSecondary} />
              <Text style={styles.secondaryBtnText}>Check Active Windows</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.permissionText}>
            Device Permission:{' '}
            {permission === 'granted'
              ? 'Enabled'
              : permission === 'denied'
                ? 'Blocked in browser settings'
                : permission === 'unsupported'
                  ? 'Not supported in this browser'
                  : 'Not granted yet'}
          </Text>

          <Pressable
            onPress={onTogglePushEnabled}
            style={[styles.toggleBtn, pushEnabled && styles.toggleBtnActive]}
          >
            <Text
              style={[styles.toggleText, pushEnabled && styles.toggleTextActive]}
            >
              {pushEnabled ? 'Window Alerts Active' : 'Window Alerts Paused'}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.columns}>
        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.sectionTitle}>Upcoming Alert Schedule</Text>
          <Text style={styles.sectionSub}>
            Active and upcoming reminders prioritized by window closing date.
          </Text>

          {upcomingAlerts.length === 0 ? (
            <Text style={styles.emptyText}>No pending reminders scheduled.</Text>
          ) : (
            <View style={styles.list}>
              {upcomingAlerts.map(({ reminder, metrics }) => {
                const statusColor =
                  metrics.status === 'overdue'
                    ? COLORS.rose
                    : metrics.status === 'due_soon'
                      ? COLORS.amber
                      : COLORS.teal;
                return (
                  <View key={reminder.id} style={styles.listRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>{reminder.title}</Text>
                      <Text style={styles.rowSub}>
                        {reminder.provider} · Ends {formatFullDate(reminder.endDate)}
                      </Text>
                    </View>
                    <Text style={[styles.rowStatus, { color: statusColor }]}>
                      {metrics.statusLabel}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={[styles.card, { flex: 1 }]}>
          <View style={styles.historyHeader}>
            <View>
              <Text style={styles.sectionTitle}>Dispatched Alert History</Text>
              <Text style={styles.sectionSub}>
                Recent notifications delivered to this device.
              </Text>
            </View>
            {logs.length > 0 && (
              <Pressable onPress={onClearLogs} style={styles.clearBtn}>
                <Text style={styles.clearText}>Clear History</Text>
              </Pressable>
            )}
          </View>

          {logs.length === 0 ? (
            <Text style={styles.emptyText}>
              No notifications dispatched yet. Allow notifications and send a test alert above.
            </Text>
          ) : (
            <View style={styles.list}>
              {logs.slice(0, 12).map((log) => (
                <View key={log.id} style={styles.logRow}>
                  <View style={styles.logTop}>
                    <Text style={styles.rowTitle}>{log.title}</Text>
                    <Text style={styles.logTime}>
                      {new Date(log.sentAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <Text style={styles.rowSub}>{log.body}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    gap: 12,
  },
  headerRow: {
    gap: 12,
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.inkPrimary,
  },
  subtitle: {
    marginTop: 4,
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.inkSecondary,
  },
  btnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  primaryBtn: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.teal,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtnText: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
  },
  secondaryBtn: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secondaryBtnText: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.inkPrimary,
  },
  disabledBtn: {
    opacity: 0.45,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceMuted,
    paddingTop: 12,
    gap: 8,
  },
  permissionText: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.inkPrimary,
  },
  toggleBtn: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgCanvas,
    justifyContent: 'center',
  },
  toggleBtnActive: {
    borderColor: COLORS.teal,
    backgroundColor: COLORS.tealBg,
  },
  toggleText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.inkSecondary,
  },
  toggleTextActive: {
    color: COLORS.tealDark,
  },
  columns: {
    gap: 16,
  },
  sectionTitle: {
    fontFamily: FONTS.display,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.inkPrimary,
  },
  sectionSub: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    color: COLORS.inkMuted,
  },
  emptyText: {
    paddingVertical: 24,
    textAlign: 'center',
    fontFamily: FONTS.sans,
    fontSize: 13,
    color: COLORS.inkMuted,
  },
  list: {
    marginTop: 4,
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceMuted,
  },
  rowTitle: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.inkPrimary,
  },
  rowSub: {
    marginTop: 2,
    fontFamily: FONTS.sans,
    fontSize: 12,
    color: COLORS.inkSecondary,
  },
  rowStatus: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    fontWeight: '700',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearBtn: {
    minHeight: 36,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  clearText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.inkSecondary,
  },
  logRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceMuted,
  },
  logTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  logTime: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.inkMuted,
  },
});
