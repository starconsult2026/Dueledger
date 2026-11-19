import React, { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { COLORS, FONTS } from '../theme/tokens';
import { CloseIcon, GlyphIcon, SmartphoneIcon } from './RNIcons';

export interface PWAInstallButtonProps {
  variant?: 'compact' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'compact',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (Platform.OS !== 'web') {
    return null;
  }

  if (isInstalled) {
    if (variant === 'card') {
      return (
        <View style={styles.installedBox}>
          <Text style={styles.installedText}>
            Installed on this device and running in standalone app mode.
          </Text>
        </View>
      );
    }
    return null;
  }

  if (isInstallable) {
    return (
      <Pressable
        onPress={() => {
          void install();
        }}
        accessibilityRole="button"
        style={styles.installBtn}
      >
        <GlyphIcon symbol="↓" size={14} color={COLORS.white} />
        <Text style={styles.installBtnText}>Install Android App</Text>
      </Pressable>
    );
  }

  return (
    <>
      <Pressable
        onPress={() => setShowGuide(true)}
        accessibilityRole="button"
        style={
          variant === 'card' ? styles.cardTriggerBtn : styles.compactTriggerBtn
        }
      >
        <SmartphoneIcon size={15} color={COLORS.teal} />
        <Text style={styles.triggerText}>
          {isIOS ? 'Install on iOS' : 'Install on Android'}
        </Text>
      </Pressable>

      <Modal
        visible={showGuide}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGuide(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>
                  {isIOS
                    ? 'Install on iPhone or iPad'
                    : 'Install DueLedger on Android'}
                </Text>
                <Text style={styles.modalSub}>
                  Run DueLedger full-screen from your home screen with offline access and notifications.
                </Text>
              </View>
              <Pressable
                onPress={() => setShowGuide(false)}
                accessibilityRole="button"
                accessibilityLabel="Close install instructions"
                style={styles.closeBtn}
              >
                <CloseIcon size={18} color={COLORS.inkMuted} />
              </Pressable>
            </View>

            <View style={styles.steps}>
              {isIOS ? (
                <>
                  <Text style={styles.stepText}>
                    1. Open this app in Safari and tap the Share icon in the toolbar.
                  </Text>
                  <Text style={styles.stepText}>
                    2. Scroll down and select Add to Home Screen.
                  </Text>
                  <Text style={styles.stepText}>
                    3. Tap Add to launch DueLedger as a standalone app.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.stepText}>
                    1. Open DueLedger in Chrome on your Android phone.
                  </Text>
                  <Text style={styles.stepText}>
                    2. Tap the three-dot browser menu in the top-right corner.
                  </Text>
                  <Text style={styles.stepText}>
                    3. Tap Install app or Add to Home screen to install the standalone web app.
                  </Text>
                </>
              )}
            </View>

            <Pressable
              onPress={() => setShowGuide(false)}
              accessibilityRole="button"
              style={styles.doneBtn}
            >
              <Text style={styles.doneBtnText}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  installedBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.emeraldBorder,
    backgroundColor: COLORS.emeraldBg,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  installedText: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    color: COLORS.emerald,
  },
  installBtn: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.teal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  installBtnText: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  cardTriggerBtn: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  compactTriggerBtn: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  triggerText: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.inkPrimary,
  },
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 22,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  modalTitle: {
    fontFamily: FONTS.display,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.inkPrimary,
  },
  modalSub: {
    marginTop: 4,
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.inkSecondary,
  },
  closeBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  steps: {
    marginTop: 16,
    gap: 10,
  },
  stepText: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.inkSecondary,
  },
  doneBtn: {
    marginTop: 20,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: COLORS.inkPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});
