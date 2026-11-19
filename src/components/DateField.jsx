import React from 'react';
import { Platform, StyleSheet, TextInput } from 'react-native';
import { COLORS, FONTS } from '../theme/tokens';

export const DateField = ({ value, min, onChange, accessibilityLabel }) => {
  if (Platform.OS === 'web') {
    return React.createElement('input', {
      type: 'date',
      value: value || '',
      min: min || undefined,
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
        paddingRight: 12,
        fontSize: 14,
        color: COLORS.inkPrimary,
        fontFamily: FONTS.mono,
        outline: 'none',
      },
    });
  }

  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder="YYYY-MM-DD"
      placeholderTextColor={COLORS.inkMuted}
      accessibilityLabel={accessibilityLabel}
      style={styles.input}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    minHeight: 44,
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    fontSize: 14,
    color: COLORS.inkPrimary,
    fontFamily: FONTS.mono,
  },
});
