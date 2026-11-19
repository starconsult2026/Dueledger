import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface IconProps {
  color?: string;
  size?: number;
}

export interface GlyphIconProps extends IconProps {
  symbol: string;
}

export const PlusIcon: React.FC<IconProps> = ({
  color = '#FFFFFF',
  size = 18,
}) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <View
      style={{
        position: 'absolute',
        width: size * 0.72,
        height: 2,
        backgroundColor: color,
        borderRadius: 1,
      }}
    />
    <View
      style={{
        position: 'absolute',
        width: 2,
        height: size * 0.72,
        backgroundColor: color,
        borderRadius: 1,
      }}
    />
  </View>
);

export const CloseIcon: React.FC<IconProps> = ({
  color = '#64748B',
  size = 18,
}) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <View
      style={{
        position: 'absolute',
        width: size * 0.75,
        height: 2,
        backgroundColor: color,
        borderRadius: 1,
        transform: [{ rotate: '45deg' }],
      }}
    />
    <View
      style={{
        position: 'absolute',
        width: size * 0.75,
        height: 2,
        backgroundColor: color,
        borderRadius: 1,
        transform: [{ rotate: '-45deg' }],
      }}
    />
  </View>
);

export const ListIcon: React.FC<IconProps> = ({
  color = '#475569',
  size = 18,
}) => (
  <View
    style={{
      width: size,
      height: size,
      justifyContent: 'space-evenly',
      paddingVertical: 2,
    }}
  >
    <View
      style={{
        height: 2,
        width: size * 0.85,
        backgroundColor: color,
        borderRadius: 1,
      }}
    />
    <View
      style={{
        height: 2,
        width: size * 0.85,
        backgroundColor: color,
        borderRadius: 1,
      }}
    />
    <View
      style={{
        height: 2,
        width: size * 0.6,
        backgroundColor: color,
        borderRadius: 1,
      }}
    />
  </View>
);

export const CalendarIcon: React.FC<IconProps> = ({
  color = '#0F766E',
  size = 18,
}) => (
  <View
    style={{
      width: size,
      height: size,
      borderWidth: 1.75,
      borderColor: color,
      borderRadius: 4,
      overflow: 'hidden',
    }}
  >
    <View style={{ height: size * 0.3, backgroundColor: color }} />
    <View style={[styles.center, { flex: 1 }]}>
      <View
        style={{
          width: size * 0.38,
          height: 2,
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
    </View>
  </View>
);

export const BellIcon: React.FC<IconProps> = ({
  color = '#0F766E',
  size = 18,
}) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <View
      style={{
        width: size * 0.68,
        height: size * 0.62,
        borderTopLeftRadius: size * 0.34,
        borderTopRightRadius: size * 0.34,
        borderBottomLeftRadius: 2,
        borderBottomRightRadius: 2,
        borderWidth: 1.75,
        borderColor: color,
      }}
    />
    <View
      style={{
        width: size * 0.84,
        height: 2,
        backgroundColor: color,
        borderRadius: 1,
        marginTop: 1,
      }}
    />
    <View
      style={{
        width: 4,
        height: 2.5,
        backgroundColor: color,
        borderBottomLeftRadius: 2,
        borderBottomRightRadius: 2,
      }}
    />
  </View>
);

export const SettingsIcon: React.FC<IconProps> = ({
  color = '#475569',
  size = 18,
}) => (
  <View
    style={{
      width: size,
      height: size,
      justifyContent: 'space-evenly',
      paddingVertical: 1,
    }}
  >
    <View style={styles.sliderRow}>
      <View style={[styles.sliderTrack, { backgroundColor: color }]} />
      <View style={[styles.sliderKnob, { borderColor: color, left: 2 }]} />
    </View>
    <View style={styles.sliderRow}>
      <View style={[styles.sliderTrack, { backgroundColor: color }]} />
      <View style={[styles.sliderKnob, { borderColor: color, right: 2 }]} />
    </View>
  </View>
);

export const SearchIcon: React.FC<IconProps> = ({
  color = '#94A3B8',
  size = 16,
}) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <View
      style={{
        width: size * 0.65,
        height: size * 0.65,
        borderRadius: size * 0.35,
        borderWidth: 1.75,
        borderColor: color,
        position: 'absolute',
        top: 1,
        left: 1,
      }}
    />
    <View
      style={{
        width: size * 0.38,
        height: 1.75,
        backgroundColor: color,
        borderRadius: 1,
        position: 'absolute',
        bottom: 2,
        right: 1,
        transform: [{ rotate: '45deg' }],
      }}
    />
  </View>
);

export const SmartphoneIcon: React.FC<IconProps> = ({
  color = '#0F766E',
  size = 16,
}) => (
  <View
    style={{
      width: size * 0.68,
      height: size,
      borderWidth: 1.75,
      borderColor: color,
      borderRadius: 3.5,
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingBottom: 2,
    }}
  >
    <View
      style={{
        width: 4,
        height: 1.5,
        backgroundColor: color,
        borderRadius: 1,
      }}
    />
  </View>
);

export const GlyphIcon: React.FC<GlyphIconProps> = ({
  symbol,
  color = '#475569',
  size = 14,
}) => (
  <Text
    style={{
      color,
      fontSize: size,
      lineHeight: size + 2,
      fontWeight: '700',
      textAlign: 'center',
    }}
  >
    {symbol}
  </Text>
);

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderRow: {
    height: 6,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderTrack: {
    height: 1.75,
    width: '100%',
    borderRadius: 1,
  },
  sliderKnob: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
  },
});
