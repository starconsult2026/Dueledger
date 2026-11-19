import React from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { COLORS, FONTS } from '../theme/tokens';
import { PWAInstallButton } from './PWAInstallButton';
import { PlusIcon } from './RNIcons';

const NAV_ITEMS = [
  { id: 'reminders', label: 'Reminders' },
  { id: 'timeline', label: 'Date Range' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'settings', label: 'Settings' },
];

export const TopBar = ({ activeTab, onTabChange, onCreateNew }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <View style={styles.header}>
      <View style={styles.inner}>
        <Pressable
          onPress={() => onTabChange('reminders')}
          accessibilityRole="button"
          style={styles.brandBtn}
        >
          <Text style={styles.brandText}>DueLedger</Text>
        </Pressable>

        {isDesktop && (
          <View style={styles.navRow}>
            {NAV_ITEMS.map((item) => {
              const active = activeTab === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => onTabChange(item.id)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  style={[styles.navLink, active && styles.navLinkActive]}
                >
                  <Text style={[styles.navText, active && styles.navTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <View style={styles.rightZone}>
          {!isDesktop && <PWAInstallButton variant="compact" />}
          {isDesktop && (
            <Pressable
              onPress={onCreateNew}
              accessibilityRole="button"
              style={styles.ctaBtn}
            >
              <PlusIcon size={14} color={COLORS.white} />
              <Text style={styles.ctaText}>New Reminder</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  inner: {
    width: '100%',
    maxWidth: 1240,
    alignSelf: 'center',
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
  },
  brandBtn: {
    minHeight: 44,
    justifyContent: 'center',
  },
  brandText: {
    fontFamily: FONTS.display,
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.inkPrimary,
    letterSpacing: -0.3,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  navLink: {
    minHeight: 44,
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    paddingHorizontal: 4,
  },
  navLinkActive: {
    borderBottomColor: COLORS.teal,
  },
  navText: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.inkSecondary,
  },
  navTextActive: {
    color: COLORS.inkPrimary,
    fontWeight: '700',
  },
  rightZone: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaBtn: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.teal,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaText: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});
