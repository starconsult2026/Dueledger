import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CATEGORY_LABELS } from '../constants/reminder';
import { COLORS, FONTS } from '../theme/tokens';
import { CloseIcon, SearchIcon } from './RNIcons';

export const ListSearchAndCategoryBar = ({
  searchQuery,
  onSearchChange,
  category,
  onCategoryChange,
  categoryCounts = {},
  totalCount = 0,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchWrap}>
        <SearchIcon size={16} color={COLORS.inkMuted} />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search services by name or provider..."
          placeholderTextColor={COLORS.inkMuted}
          accessibilityLabel="Search services by name or provider"
          returnKeyType="search"
          style={styles.searchInput}
        />
        {!!searchQuery && (
          <Pressable
            onPress={() => onSearchChange('')}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            style={styles.clearBtn}
          >
            <CloseIcon size={14} color={COLORS.inkMuted} />
          </Pressable>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        <Pressable
          onPress={() => onCategoryChange('all')}
          accessibilityRole="button"
          accessibilityState={{ selected: category === 'all' }}
          style={[styles.chip, category === 'all' && styles.chipActive]}
        >
          <Text
            style={[
              styles.chipText,
              category === 'all' && styles.chipTextActive,
            ]}
          >
            All Services
          </Text>
          <View
            style={[
              styles.countBadge,
              category === 'all' && styles.countBadgeActive,
            ]}
          >
            <Text
              style={[
                styles.countText,
                category === 'all' && styles.countTextActive,
              ]}
            >
              {totalCount}
            </Text>
          </View>
        </Pressable>

        {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
          const active = category === key;
          const count = categoryCounts[key] || 0;
          return (
            <Pressable
              key={key}
              onPress={() => onCategoryChange(active ? 'all' : key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text
                style={[styles.chipText, active && styles.chipTextActive]}
              >
                {label}
              </Text>
              <View
                style={[styles.countBadge, active && styles.countBadgeActive]}
              >
                <Text
                  style={[styles.countText, active && styles.countTextActive]}
                >
                  {count}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 12,
  },
  searchWrap: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgCanvas,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.sans,
    fontSize: 14,
    color: COLORS.inkPrimary,
    minHeight: 40,
  },
  clearBtn: {
    minWidth: 30,
    minHeight: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    minHeight: 36,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipActive: {
    borderColor: COLORS.teal,
    backgroundColor: COLORS.teal,
  },
  chipText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.inkSecondary,
  },
  chipTextActive: {
    color: COLORS.white,
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeActive: {
    backgroundColor: COLORS.tealDark,
  },
  countText: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.inkSecondary,
  },
  countTextActive: {
    color: COLORS.white,
  },
});
