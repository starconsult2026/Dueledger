import { Platform } from 'react-native';

export const COLORS = {
  bgCanvas: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  inkPrimary: '#0F172A',
  inkSecondary: '#475569',
  inkMuted: '#64748B',
  teal: '#0F766E',
  tealDark: '#115E59',
  tealSoft: '#CCFBF1',
  tealBg: '#F0FDFA',
  tealBorder: '#99F6E4',
  amber: '#B45309',
  amberBg: '#FFFBEB',
  amberBorder: '#FDE68A',
  rose: '#BE123C',
  roseBg: '#FFF1F2',
  roseBorder: '#FECDD3',
  emerald: '#047857',
  emeraldBg: '#ECFDF5',
  emeraldBorder: '#A7F3D0',
  white: '#FFFFFF',
  overlay: 'rgba(15, 23, 42, 0.5)',
};

export const FONTS = {
  display: Platform.select({
    web: '"Plus Jakarta Sans", system-ui, sans-serif',
    default: 'System',
  }),
  sans: Platform.select({
    web: '"DM Sans", system-ui, sans-serif',
    default: 'System',
  }),
  mono: Platform.select({
    web: '"JetBrains Mono", monospace',
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),
};
