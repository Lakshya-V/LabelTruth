import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';

interface Props {
  score: number;
  badgeColor?: string;
}

const getBadgeDetails = (color?: string) => {
  const normalized = String(color ?? '').trim().toUpperCase();
  switch (normalized) {
    case 'GREEN':
      return {
        bg: theme.colors.semantic.green,
        label: 'Looks good',
        badgeText: 'GREEN',
        icon: 'check-circle' as const,
      };
    case 'AMBER':
      return {
        bg: theme.colors.semantic.amber,
        label: 'Worth a closer look',
        badgeText: 'AMBER',
        icon: 'alert-circle' as const,
      };
    case 'RED':
      return {
        bg: theme.colors.semantic.red,
        label: 'Consider carefully',
        badgeText: 'RED',
        icon: 'slash' as const,
      };
    default:
      return {
        bg: theme.colors.textLight,
        label: 'Evaluated',
        badgeText: normalized || 'UNKNOWN',
        icon: 'info' as const,
      };
  }
};

export const OverallScoreCard = ({ score, badgeColor }: Props) => {
  const badge = getBadgeDetails(badgeColor);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.eyebrow}>OVERALL RESULT</Text>
        <View style={[styles.badgePill, { backgroundColor: badge.bg }]}>
          <Text style={styles.badgePillText}>{badge.badgeText}</Text>
        </View>
      </View>

      <View style={styles.scoreRow}>
        <Text style={[styles.score, { color: badge.bg }]}>{score}</Text>
        <Text style={styles.outOf}>/ 100</Text>
      </View>

      <View style={styles.verdictRow}>
        <Feather name={badge.icon} size={18} color={badge.bg} />
        <Text style={styles.verdictText}>{badge.label}</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  eyebrow: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '700',
  },
  badgePill: {
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.s,
    borderRadius: theme.radii.pill,
  },
  badgePillText: {
    ...theme.typography.caption,
    color: '#FFF',
    fontWeight: '700',
    fontSize: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.s,
  },
  score: {
    fontSize: 64,
    fontWeight: '800',
    letterSpacing: -2,
    lineHeight: 70,
  },
  outOf: {
    ...theme.typography.h3,
    color: theme.colors.textLight,
    marginLeft: theme.spacing.xs,
  },
  verdictRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.s,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border + '50',
  },
  verdictText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
});
