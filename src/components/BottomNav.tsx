import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { COLORS, FONTS } from '../theme/tokens';
import type { AppTab } from '../types/reminder';
import {
  BellIcon,
  CalendarIcon,
  type IconProps,
  ListIcon,
  SettingsIcon,
} from './RNIcons';

export interface BottomNavProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  urgentCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  urgentCount,
}) => {
  const { width } = useWindowDimensions();
  if (width >= 768) return null;

  const tabs: Array<{ id: AppTab; label: string; Icon: React.FC<IconProps> }> = [
    { id: 'reminders', label: 'Reminders', Icon: ListIcon },
    { id: 'timeline', label: 'Date Range', Icon: CalendarIcon },
    { id: 'alerts', label: 'Alerts', Icon: BellIcon },
    { id: 'settings', label: 'Settings', Icon: SettingsIcon },
  ];

  return (
    <View style={styles.bar}>
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        const color = active ? COLORS.teal : COLORS.inkMuted;
        const Icon = tab.Icon;

        return (
          <Pressable
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={styles.tabBtn}
          >
            <View style={styles.iconWrap}>
              <Icon size={19} color={color} />
              {tab.id === 'alerts' && urgentCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{urgentCount}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, active && styles.labelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    height: 64,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingBottom: 4,
  },
  tabBtn: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconWrap: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.amber,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  label: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.inkMuted,
  },
  labelActive: {
    color: COLORS.teal,
    fontWeight: '700',
  },
});
