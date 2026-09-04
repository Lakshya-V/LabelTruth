import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';

interface Props {
  eNumbers: string[];
}

export const ENumbersCard = ({ eNumbers }: Props) => {
  if (!eNumbers || eNumbers.length === 0) return null;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Feather name="hash" size={20} color={theme.colors.semantic.red} />
        <Text style={styles.header}>E-Numbers Detected</Text>
      </View>
      <View style={styles.badgeContainer}>
        {eNumbers.map((enumStr, index) => (
          <View key={index} style={styles.badge}>
            <Text style={styles.badgeText}>{enumStr}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.card,
    padding: theme.spacing.l,
    marginVertical: theme.spacing.s,
    ...theme.shadows.subtle,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  header: {
    ...theme.typography.h3,
    marginLeft: theme.spacing.s,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.s,
  },
  badge: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.pill,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.m,
  },
  badgeText: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  }
});
