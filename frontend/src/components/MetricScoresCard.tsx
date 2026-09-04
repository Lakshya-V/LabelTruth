import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';

interface Props {
  healthScore?: number | null;
  ecoScore?: number | null;
}

export const MetricScoresCard = ({ healthScore, ecoScore }: Props) => {
  return (
    <View style={styles.container}>
      {/* Health Score Card */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={[styles.iconWrapper, { backgroundColor: '#FEE2E2' }]}>
            <Feather name="heart" size={16} color={theme.colors.semantic.red} />
          </View>
          <Text style={styles.categoryLabel}>HEALTH</Text>
        </View>
        <Text style={styles.title}>Health Score</Text>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreNumber}>
            {healthScore != null ? healthScore : '--'}
          </Text>
          <Text style={styles.outOf}>/ 100</Text>
        </View>
      </View>

      {/* Environmental Impact Card */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={[styles.iconWrapper, { backgroundColor: '#D1FAE5' }]}>
            <Feather name="globe" size={16} color={theme.colors.semantic.green} />
          </View>
          <Text style={styles.categoryLabel}>PLANET</Text>
        </View>
        <Text style={styles.title}>Environmental Impact</Text>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreNumber}>
            {ecoScore != null ? ecoScore : '--'}
          </Text>
          <Text style={styles.outOf}>/ 100</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: theme.spacing.m,
    marginVertical: theme.spacing.s,
  },
  card: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.card,
    padding: theme.spacing.m,
    ...theme.shadows.subtle,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    ...theme.typography.caption,
    fontSize: 10,
    letterSpacing: 0.5,
    color: theme.colors.textSecondary,
    fontWeight: '700',
  },
  title: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.s,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  outOf: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    marginLeft: 4,
    fontWeight: '500',
  },
});
