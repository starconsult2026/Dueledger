import React from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS } from '../theme/tokens';
import { downloadIcsFile } from '../utils/calendarExport';
import { PWAInstallButton } from './PWAInstallButton';
import { CalendarIcon, GlyphIcon } from './RNIcons';

const LEAD_OPTIONS = [
  { day: 7, label: '7 days before' },
  { day: 3, label: '3 days before' },
  { day: 1, label: '1 day before' },
  { day: 0, label: 'Due day' },
];

const CURRENCY_OPTIONS = [{ code: 'INR', label: 'INR (₹ Rupees)' }];

export const SettingsView = ({
  settings,
  reminders,
  onUpdateSettings,
  onResetDemoData,
  onClearAllReminders,
}) => {
  const origin =
    Platform.OS === 'web' && typeof window !== 'undefined'
      ? window.location.origin
      : 'https://dueledger.app';
  const host =
    Platform.OS === 'web' && typeof window !== 'undefined'
      ? window.location.host
      : 'dueledger.app';
  const pwabuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(
    origin
  )}`;

  const handleDownloadTwaManifest = () => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const twaManifest = {
      packageId: 'app.dueledger.reminders',
      host,
      name: 'DueLedger',
      launcherName: 'DueLedger',
      display: 'standalone',
      themeColor: '#0F766E',
      themeColorDark: '#0F766E',
      navigationColor: '#F8FAFC',
      navigationColorDark: '#0F172A',
      navigationDividerColor: '#E2E8F0',
      backgroundColor: '#F8FAFC',
      enableNotifications: true,
      startUrl: '/',
      iconUrl: `${origin}/pwa-512x512.png`,
      maskableIconUrl: `${origin}/pwa-maskable-512x512.png`,
      splashScreenFadeOutDuration: 300,
      appVersionName: '1.0.0',
      appVersionCode: 1,
      shortcuts: [],
      fallbackType: 'customtabs',
      enableSiteSettingsShortcut: 'true',
      isChromeOSOnly: false,
      webManifestUrl: `${origin}/manifest.webmanifest`,
    };

    const blob = new Blob([JSON.stringify(twaManifest, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'twa-manifest.json';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const toggleDefaultLead = (day) => {
    const exists = settings.defaultLeadDays.includes(day);
    const next = exists
      ? settings.defaultLeadDays.filter((d) => d !== day)
      : [...settings.defaultLeadDays, day].sort((a, b) => b - a);
    onUpdateSettings({ ...settings, defaultLeadDays: next });
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Android App & APK Packaging</Text>
        <Text style={styles.subtitle}>
          Install directly on Android Chrome as a standalone WebAPK, or generate a downloadable signed .apk package via PWABuilder or Bubblewrap.
        </Text>

        <View style={styles.wrapRow}>
          <PWAInstallButton variant="card" />

          <Pressable
            onPress={() => Linking.openURL(pwabuilderUrl).catch(() => {})}
            style={styles.outlineBtn}
          >
            <Text style={styles.outlineText}>Package APK via PWABuilder ↗</Text>
          </Pressable>

          {Platform.OS === 'web' && (
            <Pressable
              onPress={handleDownloadTwaManifest}
              style={styles.mutedBtn}
            >
              <Text style={styles.mutedText}>Download twa-manifest.json</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Google Calendar Export & Backup</Text>
        <Text style={styles.subtitle}>
          Download all {reminders.length} reminders as a standard .ics calendar file with built-in date-range alarms to import into Google Calendar.
        </Text>

        {Platform.OS === 'web' && (
          <View style={styles.wrapRow}>
            <Pressable
              disabled={reminders.length === 0}
              onPress={() =>
                downloadIcsFile(reminders, 'dueledger-all-reminders.ics')
              }
              style={[styles.darkBtn, reminders.length === 0 && styles.disabledBtn]}
            >
              <CalendarIcon size={15} color={COLORS.white} />
              <Text style={styles.darkBtnText}>
                Export All Reminders (.ics)
              </Text>
              <GlyphIcon symbol="↓" size={14} color={COLORS.white} />
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Reminder Defaults</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Default Currency</Text>
          <View style={styles.wrapRow}>
            {CURRENCY_OPTIONS.map((curr) => {
              const active = settings.defaultCurrency === curr.code;
              return (
                <Pressable
                  key={curr.code}
                  onPress={() =>
                    onUpdateSettings({ ...settings, defaultCurrency: curr.code })
                  }
                  style={[styles.chipBtn, active && styles.chipBtnActive]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {curr.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Default Push Notification Lead Times</Text>
          <View style={styles.wrapRow}>
            {LEAD_OPTIONS.map((opt) => {
              const active = settings.defaultLeadDays.includes(opt.day);
              return (
                <Pressable
                  key={opt.day}
                  onPress={() => toggleDefaultLead(opt.day)}
                  style={[styles.chipBtn, active && styles.chipBtnActive]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Local Device Storage</Text>
        <Text style={styles.subtitle}>
          Reminders are stored privately on your device so they remain available offline.
        </Text>

        <View style={styles.wrapRow}>
          <Pressable onPress={onResetDemoData} style={styles.outlineBtn}>
            <GlyphIcon symbol="↻" size={14} color={COLORS.inkSecondary} />
            <Text style={styles.outlineText}>Restore Sample Reminders</Text>
          </Pressable>

          <Pressable onPress={onClearAllReminders} style={styles.dangerBtn}>
            <GlyphIcon symbol="✕" size={13} color={COLORS.rose} />
            <Text style={styles.dangerText}>Clear All Reminders</Text>
          </Pressable>
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
  title: {
    fontFamily: FONTS.display,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.inkPrimary,
  },
  subtitle: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.inkSecondary,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  outlineBtn: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  outlineText: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.inkPrimary,
  },
  mutedBtn: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgCanvas,
    justifyContent: 'center',
  },
  mutedText: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.inkSecondary,
  },
  darkBtn: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.inkPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  darkBtnText: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
  },
  disabledBtn: {
    opacity: 0.45,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.inkSecondary,
  },
  chipBtn: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
  },
  chipBtnActive: {
    borderColor: COLORS.teal,
    backgroundColor: COLORS.tealBg,
  },
  chipText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.inkSecondary,
  },
  chipTextActive: {
    color: COLORS.tealDark,
  },
  dangerBtn: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.roseBorder,
    backgroundColor: COLORS.roseBg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dangerText: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.rose,
  },
});
