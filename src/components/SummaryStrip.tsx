import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { COLORS, FONTS } from '../theme/tokens';
import type { Reminder } from '../types/reminder';
import { getReminderWindowMetrics } from '../utils/dateRange';

export interface SummaryStripProps {
  reminders: Reminder[];
}

export const SummaryStrip: React.FC<SummaryStripProps> = ({ reminders }) => {
  const { width } = useWindowDimensions();
  const isWide = width >= 640;

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
      color: COLORS.teal,
    },
    {
      label: 'Due Within 3d',
      value: dueSoonCount,
      sub: 'Action needed',
      color: dueSoonCount > 0 ? COLORS.amber : COLORS.inkPrimary,
    },
    {
      label: 'Overdue',
      value: overdueCount,
      sub: 'Past end date',
      color: overdueCount > 0 ? COLORS.rose : COLORS.inkPrimary,
    },
    {
      label: 'Completed',
      value: completedCount,
      sub: 'Settled items',
      color: COLORS.emerald,
    },
  ];

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View
          key={item.label}
          style={[styles.card, { width: isWide ? '23.6%' : '48.2%' }]}
        >
          <Text style={styles.label}>{item.label}</Text>
          <Text style={[styles.value, { color: item.color }]}>{item.value}</Text>
          <Text style={styles.sub}>{item.sub}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  label: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.inkMuted,
  },
  value: {
    marginTop: 4,
    fontFamily: FONTS.mono,
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  sub: {
    marginTop: 2,
    fontFamily: FONTS.sans,
    fontSize: 12,
    color: COLORS.inkMuted,
  },
});
