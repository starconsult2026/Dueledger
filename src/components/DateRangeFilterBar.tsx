import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS, FONTS } from '../theme/tokens';
import type { DateRangePreset } from '../types/reminder';
import { DateField } from './DateField';

const PRESETS: Array<{ id: DateRangePreset; label: string }> = [
  { id: 'all', label: 'All Dates' },
  { id: 'active_now', label: 'Active Now' },
  { id: 'next_7_days', label: 'Next 7 Days' },
  { id: 'this_month', label: 'This Month' },
  { id: 'custom', label: 'Custom Range' },
];

export interface DateRangeFilterBarProps {
  preset: DateRangePreset;
  onPresetChange: (preset: DateRangePreset) => void;
  customStart: string;
  customEnd: string;
  onCustomStartChange: (dateStr: string) => void;
  onCustomEndChange: (dateStr: string) => void;
  showCompleted: boolean;
  onToggleShowCompleted: () => void;
}

export const DateRangeFilterBar: React.FC<DateRangeFilterBarProps> = ({
  preset,
  onPresetChange,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
  showCompleted,
  onToggleShowCompleted,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.presetTrack}
        >
          {PRESETS.map((item) => {
            const active = preset === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => onPresetChange(item.id)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                style={[styles.presetBtn, active && styles.presetBtnActive]}
              >
                <Text
                  style={[styles.presetText, active && styles.presetTextActive]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable
          onPress={onToggleShowCompleted}
          accessibilityRole="button"
          style={[styles.toggleBtn, showCompleted && styles.toggleBtnActive]}
        >
          <Text
            style={[styles.toggleText, showCompleted && styles.toggleTextActive]}
          >
            {showCompleted ? 'Showing Completed' : 'Hide Completed'}
          </Text>
        </Pressable>
      </View>

      {preset === 'custom' && (
        <View style={styles.customRangeBox}>
          <Text style={styles.customTitle}>Date Range Filter</Text>
          <View style={styles.customDateRow}>
            <View style={styles.dateCol}>
              <Text style={styles.dateLabel}>From</Text>
              <DateField
                value={customStart}
                onChange={onCustomStartChange}
                accessibilityLabel="Filter start date"
              />
            </View>
            <View style={styles.dateCol}>
              <Text style={styles.dateLabel}>To</Text>
              <DateField
                value={customEnd}
                min={customStart}
                onChange={onCustomEndChange}
                accessibilityLabel="Filter end date"
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  presetTrack: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  presetBtn: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetBtnActive: {
    backgroundColor: COLORS.surface,
  },
  presetText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.inkSecondary,
  },
  presetTextActive: {
    color: COLORS.inkPrimary,
  },
  toggleBtn: {
    minHeight: 42,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
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
  customRangeBox: {
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceMuted,
    paddingTop: 12,
    gap: 8,
  },
  customTitle: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.inkSecondary,
  },
  customDateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateCol: {
    flex: 1,
    gap: 4,
  },
  dateLabel: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    color: COLORS.inkMuted,
  },
});
