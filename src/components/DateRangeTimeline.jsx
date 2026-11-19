import React, { useMemo, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORY_LABELS } from '../constants/reminder';
import { COLORS, FONTS } from '../theme/tokens';
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
import { DateField } from './DateField';
import { CalendarIcon, GlyphIcon } from './RNIcons';

export const DateRangeTimeline = ({
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
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Date Range Window Timeline</Text>
            <Text style={styles.subtitle}>
              Inspect overlapping bank and service periods across any date range and export them to Google Calendar.
            </Text>
          </View>

          {Platform.OS === 'web' && (
            <Pressable
              disabled={matchingReminders.length === 0}
              onPress={handleExportRange}
              style={[
                styles.exportBtn,
                matchingReminders.length === 0 && styles.disabledBtn,
              ]}
            >
              <GlyphIcon symbol="↓" size={14} color={COLORS.white} />
              <Text style={styles.exportBtnText}>Export Range (.ics)</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.controlsGrid}>
          <View style={styles.dateCol}>
            <Text style={styles.label}>Range Start Date</Text>
            <DateField
              value={rangeStart}
              onChange={(v) => {
                setRangeStart(v);
                if (v > rangeEnd) setRangeEnd(v);
              }}
              accessibilityLabel="Timeline range start date"
            />
          </View>

          <View style={styles.dateCol}>
            <Text style={styles.label}>Range End Date</Text>
            <DateField
              value={rangeEnd}
              min={rangeStart}
              onChange={setRangeEnd}
              accessibilityLabel="Timeline range end date"
            />
          </View>
        </View>

        <View style={styles.presetRow}>
          <Pressable
            onPress={() => {
              setRangeStart(addDaysToDateString(today, -7));
              setRangeEnd(addDaysToDateString(today, 23));
            }}
            style={styles.presetBtn}
          >
            <Text style={styles.presetText}>30-Day View</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              const d = new Date();
              const first = new Date(d.getFullYear(), d.getMonth(), 1);
              const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
              setRangeStart(toLocalDateString(first));
              setRangeEnd(toLocalDateString(last));
            }}
            style={styles.presetBtn}
          >
            <Text style={styles.presetText}>Current Month</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.rangeMetaRow}>
          <Text style={styles.rangeMetaText}>{formatFullDate(rangeStart)}</Text>
          <Text style={styles.rangeMetaText}>
            {matchingReminders.length}{' '}
            {matchingReminders.length === 1 ? 'window' : 'windows'} ({totalRangeDays}d)
          </Text>
          <Text style={styles.rangeMetaText}>{formatFullDate(rangeEnd)}</Text>
        </View>

        {matchingReminders.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>
              No bank or service windows overlap this date range.
            </Text>
            <Text style={styles.emptySub}>
              Widen the start or end date above to view upcoming schedules.
            </Text>
          </View>
        ) : (
          <View style={styles.barsWrap}>
            {todayOffsetPct !== null && (
              <View style={[styles.todayLine, { left: `${todayOffsetPct}%` }]}>
                <View style={styles.todayPill}>
                  <Text style={styles.todayText}>Today</Text>
                </View>
              </View>
            )}

            {matchingReminders.map((reminder) => {
              const metrics = getReminderWindowMetrics(reminder);
              const clampedStart =
                reminder.startDate < rangeStart ? rangeStart : reminder.startDate;
              const clampedEnd =
                reminder.endDate > rangeEnd ? rangeEnd : reminder.endDate;
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
                  ? COLORS.emerald
                  : metrics.status === 'overdue'
                    ? COLORS.rose
                    : metrics.status === 'due_soon'
                      ? COLORS.amber
                      : COLORS.teal;

              const amount = formatCurrency(reminder.amount, reminder.currency);

              return (
                <View key={reminder.id} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Pressable onPress={() => onEdit(reminder)} style={{ flex: 1 }}>
                      <Text style={styles.itemTitle}>{reminder.title}</Text>
                      <Text style={styles.itemSub}>
                        {CATEGORY_LABELS[reminder.category]} · {reminder.provider}
                      </Text>
                    </Pressable>

                    <View style={styles.itemRight}>
                      {!!amount && <Text style={styles.itemAmount}>{amount}</Text>}
                      <Text style={styles.itemDates}>
                        {formatShortDate(reminder.startDate)} –{' '}
                        {formatShortDate(reminder.endDate)}
                      </Text>
                      <Pressable
                        onPress={() => {
                          Linking.openURL(buildGoogleCalendarUrl(reminder)).catch(() => {});
                          onMarkCalendarSynced(reminder.id);
                        }}
                        style={styles.addCalBtn}
                      >
                        <CalendarIcon size={12} color={COLORS.teal} />
                        <Text style={styles.addCalText}>Add ↗</Text>
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.track}>
                    <View
                      style={[
                        styles.bar,
                        {
                          left: `${leftPct}%`,
                          width: `${Math.min(100 - leftPct, widthPct)}%`,
                          backgroundColor: barColor,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}
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
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  exportBtn: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.teal,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  exportBtnText: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
  },
  controlsGrid: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceMuted,
    paddingTop: 14,
  },
  dateCol: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.inkSecondary,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetBtn: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
  },
  presetText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.inkSecondary,
  },
  rangeMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceMuted,
    paddingBottom: 10,
  },
  rangeMetaText: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.inkMuted,
  },
  emptyBox: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.inkSecondary,
  },
  emptySub: {
    marginTop: 4,
    fontFamily: FONTS.sans,
    fontSize: 12,
    color: COLORS.inkMuted,
  },
  barsWrap: {
    position: 'relative',
    gap: 12,
    paddingTop: 16,
  },
  todayLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1.5,
    backgroundColor: COLORS.rose,
    zIndex: 10,
  },
  todayPill: {
    backgroundColor: COLORS.rose,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginLeft: -18,
  },
  todayText: {
    fontFamily: FONTS.sans,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  itemCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceMuted,
    backgroundColor: COLORS.bgCanvas,
    padding: 12,
    gap: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  itemTitle: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.inkPrimary,
  },
  itemSub: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    color: COLORS.inkMuted,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemAmount: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.inkPrimary,
  },
  itemDates: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.inkSecondary,
  },
  addCalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addCalText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.teal,
  },
  track: {
    position: 'relative',
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
  },
  bar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 5,
  },
});
