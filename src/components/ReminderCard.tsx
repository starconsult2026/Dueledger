import React from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORY_LABELS, RECURRENCE_LABELS } from '../constants/reminder';
import { COLORS, FONTS } from '../theme/tokens';
import type { Reminder } from '../types/reminder';
import { buildGoogleCalendarUrl, downloadIcsFile } from '../utils/calendarExport';
import {
  formatCurrency,
  formatFullDate,
  formatShortDate,
  getReminderWindowMetrics,
} from '../utils/dateRange';
import { BellIcon, CalendarIcon, GlyphIcon } from './RNIcons';

export interface ReminderCardProps {
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

  const statusColor =
    metrics.status === 'completed'
      ? COLORS.emerald
      : metrics.status === 'overdue'
        ? COLORS.rose
        : metrics.status === 'due_soon'
          ? COLORS.amber
          : metrics.status === 'upcoming'
            ? COLORS.inkSecondary
            : COLORS.teal;

  const handleOpenGoogleCalendar = () => {
    Linking.openURL(googleCalUrl).catch(() => {});
    onMarkCalendarSynced(reminder.id);
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleCol}>
          <Text style={styles.metaLine}>
            {CATEGORY_LABELS[reminder.category]} · {reminder.provider}
            {reminder.accountRef ? ` · ${reminder.accountRef}` : ''}
          </Text>
          <Text
            style={[styles.title, reminder.completed && styles.titleCompleted]}
          >
            {reminder.title}
          </Text>
        </View>

        <View style={styles.rightCol}>
          {!!amountLabel && <Text style={styles.amount}>{amountLabel}</Text>}
          <Text style={[styles.statusText, { color: statusColor }]}>
            {metrics.statusLabel}
          </Text>
        </View>
      </View>

      <View style={styles.windowSection}>
        <View style={styles.dateRow}>
          <Text style={styles.dateRangeText}>
            {formatShortDate(reminder.startDate)} —{' '}
            {formatFullDate(reminder.endDate)}
          </Text>
          <Text style={styles.spanText}>{metrics.totalDays}d window</Text>
        </View>

        <View
          style={styles.track}
          accessibilityRole="progressbar"
          accessibilityValue={{
            min: 0,
            max: 100,
            now: metrics.progressPercent,
          }}
        >
          <View
            style={[
              styles.fill,
              {
                width: `${metrics.progressPercent}%`,
                backgroundColor: statusColor,
              },
            ]}
          />
        </View>

        <View style={styles.infoFooter}>
          <View style={styles.alertInfo}>
            <BellIcon size={13} color={COLORS.inkMuted} />
            <Text style={styles.infoText}>
              {reminder.notifyDaysBefore.length > 0
                ? `Alerts: ${reminder.notifyDaysBefore
                    .map((d) => (d === 0 ? 'due day' : `${d}d prior`))
                    .join(', ')}`
                : 'No lead alerts'}{' '}
              · {RECURRENCE_LABELS[reminder.recurrence]}
            </Text>
          </View>

          {!!reminder.calendarSyncedAt && (
            <Text style={styles.syncedText}>
              Exported {new Date(reminder.calendarSyncedAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>

      {!!reminder.notes && <Text style={styles.notes}>{reminder.notes}</Text>}

      <View style={styles.actionRow}>
        <View style={styles.leftActions}>
          <Pressable
            onPress={() => onToggleComplete(reminder.id)}
            accessibilityRole="button"
            style={[
              styles.completeBtn,
              reminder.completed
                ? styles.completeBtnDone
                : styles.completeBtnPending,
            ]}
          >
            <GlyphIcon
              symbol={reminder.completed ? '✓' : '○'}
              size={13}
              color={reminder.completed ? COLORS.emerald : COLORS.white}
            />
            <Text
              style={[
                styles.completeText,
                { color: reminder.completed ? COLORS.emerald : COLORS.white },
              ]}
            >
              {reminder.completed ? 'Completed' : 'Mark Paid / Done'}
            </Text>
          </Pressable>

          {reminder.completed && reminder.recurrence !== 'none' && (
            <Pressable
              onPress={() => onAdvanceCycle(reminder.id)}
              accessibilityRole="button"
              style={styles.cycleBtn}
            >
              <GlyphIcon symbol="↻" size={13} color={COLORS.tealDark} />
              <Text style={styles.cycleText}>Next Cycle</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.rightActions}>
          <Pressable
            onPress={handleOpenGoogleCalendar}
            accessibilityRole="link"
            style={styles.outlineBtn}
          >
            <CalendarIcon size={13} color={COLORS.teal} />
            <Text style={styles.outlineBtnText}>Google Calendar</Text>
            <GlyphIcon symbol="↗" size={12} color={COLORS.inkMuted} />
          </Pressable>

          {Platform.OS === 'web' && (
            <Pressable
              onPress={() => {
                downloadIcsFile(
                  [reminder],
                  `${reminder.title.toLowerCase().replace(/\s+/g, '-')}.ics`
                );
                onMarkCalendarSynced(reminder.id);
              }}
              accessibilityRole="button"
              style={styles.outlineBtn}
            >
              <GlyphIcon symbol="↓" size={12} color={COLORS.inkSecondary} />
              <Text style={styles.outlineBtnText}>.ics</Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => onEdit(reminder)}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${reminder.title}`}
            style={styles.iconBtn}
          >
            <GlyphIcon symbol="✎" size={14} color={COLORS.inkSecondary} />
          </Pressable>

          <Pressable
            onPress={() => onDelete(reminder)}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${reminder.title}`}
            style={styles.iconBtn}
          >
            <GlyphIcon symbol="✕" size={14} color={COLORS.rose} />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleCol: {
    flex: 1,
  },
  metaLine: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    color: COLORS.inkSecondary,
  },
  title: {
    marginTop: 4,
    fontFamily: FONTS.display,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.inkPrimary,
  },
  titleCompleted: {
    color: COLORS.inkMuted,
    textDecorationLine: 'line-through',
  },
  rightCol: {
    alignItems: 'flex-end',
  },
  amount: {
    fontFamily: FONTS.mono,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.inkPrimary,
    fontVariant: ['tabular-nums'],
  },
  statusText: {
    marginTop: 2,
    fontFamily: FONTS.mono,
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  windowSection: {
    marginTop: 14,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateRangeText: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.inkSecondary,
    fontVariant: ['tabular-nums'],
  },
  spanText: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.inkMuted,
    fontVariant: ['tabular-nums'],
  },
  track: {
    marginTop: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceMuted,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  infoFooter: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  alertInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    color: COLORS.inkMuted,
  },
  syncedText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.teal,
  },
  notes: {
    marginTop: 10,
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.inkSecondary,
  },
  actionRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceMuted,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  leftActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  completeBtn: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  completeBtnPending: {
    backgroundColor: COLORS.inkPrimary,
  },
  completeBtnDone: {
    backgroundColor: COLORS.emeraldBg,
  },
  completeText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '600',
  },
  cycleBtn: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.tealBorder,
    backgroundColor: COLORS.tealBg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cycleText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.tealDark,
  },
  rightActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  outlineBtn: {
    minHeight: 40,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  outlineBtnText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.inkSecondary,
  },
  iconBtn: {
    minWidth: 40,
    minHeight: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
