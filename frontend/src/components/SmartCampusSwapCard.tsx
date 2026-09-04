import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';

interface Props {
  swapItem: string;
  approxCost: string;
  benefit: string;
}

export const SmartCampusSwapCard = ({ swapItem, approxCost, benefit }: Props) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Feather name="refresh-cw" size={16} color={theme.colors.primary} />
        <Text style={styles.title}>Smart Campus Swap</Text>
      </View>
      <Text style={styles.item}>{swapItem}</Text>
      <View style={styles.detailsRow}>
        <View style={styles.pill}>
          <Text style={styles.costText}>{approxCost}</Text>
        </View>
        <Text style={styles.benefit}>{benefit}</Text>
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
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
    ...theme.shadows.subtle,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s,
    marginBottom: theme.spacing.s,
  },
  title: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  item: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.m,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.m,
  },
  pill: {
    backgroundColor: theme.colors.primary + '20',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.m,
    borderRadius: theme.radii.pill,
  },
  costText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  benefit: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    flex: 1,
  },
});
