import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';

interface Props {
  name: string;
  score: number;
  badgeColor: string;
  date: string;
  onPress?: () => void;
}

export const ScanCard = ({ name, score, badgeColor, date, onPress }: Props) => {
  const getBadgeBg = (color: string) => {
    switch (color.toUpperCase()) {
      case 'GREEN': return theme.colors.semantic.green;
      case 'AMBER': return theme.colors.semantic.amber;
      case 'RED': return theme.colors.semantic.red;
      default: return theme.colors.textLight;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
      <View style={styles.scoreContainer}>
        <Text style={[styles.score, { color: getBadgeBg(badgeColor) }]}>{score}</Text>
        <Feather name="chevron-right" size={20} color={theme.colors.border} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.shadows.subtle,
    borderWidth: 1,
    borderColor: theme.colors.border + '50',
  },
  content: {
    flex: 1,
  },
  name: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    ...theme.typography.caption,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s,
  },
  score: {
    ...theme.typography.h3,
    fontWeight: '700',
  }
});
