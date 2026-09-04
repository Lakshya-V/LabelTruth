import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';

interface Props {
  score: number;
  badgeColor: string;
  title?: string;
}

const getBadgeStyles = (color: string) => {
  switch (color.toUpperCase()) {
    case 'GREEN': return { bg: theme.colors.semantic.green, label: 'Excellent' };
    case 'AMBER': return { bg: theme.colors.semantic.amber, label: 'Fair' };
    case 'RED': return { bg: theme.colors.semantic.red, label: 'Poor' };
    default: return { bg: theme.colors.textLight, label: 'Unknown' };
  }
};

export const ScoreCard = ({ score, badgeColor, title = 'Health Score' }: Props) => {
  const badge = getBadgeStyles(badgeColor);
  
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <Feather name="info" size={16} color={theme.colors.textLight} />
      </View>
      <View style={styles.scoreRow}>
        <Text style={[styles.score, { color: badge.bg }]}>{score}</Text>
        <Text style={styles.outOf}>/ 100</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: badge.bg }]}>
        <Text style={styles.badgeText}>{badge.label}</Text>
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
  title: {
    ...theme.typography.h3,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.m,
  },
  score: {
    fontSize: 56,
    fontWeight: '700',
    letterSpacing: -1.5,
  },
  outOf: {
    ...theme.typography.h3,
    color: theme.colors.textLight,
    marginLeft: theme.spacing.xs,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
    borderRadius: theme.radii.pill,
  },
  badgeText: {
    ...theme.typography.caption,
    color: '#FFF',
    fontWeight: '700',
  }
});
