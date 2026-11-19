import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS } from '../theme/tokens';

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(
    Platform.OS === 'web' && typeof navigator !== 'undefined'
      ? navigator.onLine
      : true
  );

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return undefined;
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>Offline Mode — Local device reminders active</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    bottom: 76,
    left: 16,
    borderRadius: 12,
    backgroundColor: COLORS.amber,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  text: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
});
