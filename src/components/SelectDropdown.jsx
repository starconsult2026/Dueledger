import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS, FONTS } from '../theme/tokens';
import { CloseIcon, GlyphIcon } from './RNIcons';

export const SelectDropdown = ({
  value,
  options,
  onChange,
  accessibilityLabel,
}) => {
  const [open, setOpen] = useState(false);

  if (Platform.OS === 'web') {
    return React.createElement(
      'select',
      {
        value,
        'aria-label': accessibilityLabel,
        onChange: (e) => onChange(e.target.value),
        style: {
          minHeight: 44,
          width: '100%',
          boxSizing: 'border-box',
          borderRadius: 12,
          border: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.surface,
          paddingLeft: 12,
          paddingRight: 28,
          fontSize: 14,
          fontWeight: 500,
          color: COLORS.inkPrimary,
          fontFamily: FONTS.sans,
          outline: 'none',
          cursor: 'pointer',
        },
      },
      options.map((opt) =>
        React.createElement(
          'option',
          { key: opt.value, value: opt.value },
          opt.label
        )
      )
    );
  }

  const selected = options.find((opt) => opt.value === value) || options[0];

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={styles.trigger}
      >
        <Text style={styles.triggerText} numberOfLines={1}>
          {selected ? selected.label : 'Select'}
        </Text>
        <GlyphIcon symbol="▾" size={14} color={COLORS.inkMuted} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {accessibilityLabel || 'Select Option'}
              </Text>
              <Pressable
                onPress={() => setOpen(false)}
                accessibilityRole="button"
                accessibilityLabel="Close dropdown"
                style={styles.closeBtn}
              >
                <CloseIcon size={18} color={COLORS.inkMuted} />
              </Pressable>
            </View>
            <ScrollView style={styles.list}>
              {options.map((opt) => {
                const active = opt.value === value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    style={[styles.optionRow, active && styles.optionRowActive]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        active && styles.optionTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {active && (
                      <GlyphIcon symbol="✓" size={14} color={COLORS.teal} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    minHeight: 44,
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  triggerText: {
    flex: 1,
    fontFamily: FONTS.sans,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.inkPrimary,
  },
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  sheet: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '70%',
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceMuted,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontFamily: FONTS.display,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.inkPrimary,
  },
  closeBtn: {
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    maxHeight: 320,
  },
  optionRow: {
    minHeight: 46,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceMuted,
  },
  optionRowActive: {
    backgroundColor: COLORS.tealBg,
  },
  optionText: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    color: COLORS.inkPrimary,
  },
  optionTextActive: {
    fontWeight: '700',
    color: COLORS.tealDark,
  },
});
