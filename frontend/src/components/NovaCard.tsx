import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

interface Props {
  level: number;
}

export const NovaCard = ({ level }: Props) => {
  const getNovaDetails = () => {
    switch(level) {
      case 1: return { title: 'Unprocessed or minimally processed', color: theme.colors.semantic.green };
      case 2: return { title: 'Processed culinary ingredients', color: theme.colors.semantic.green };
      case 3: return { title: 'Processed foods', color: theme.colors.semantic.amber };
      case 4: return { title: 'Ultra-processed foods', color: theme.colors.semantic.red };
      default: return { title: 'Unknown processing level', color: theme.colors.textLight };
    }
  };

  const details = getNovaDetails();

  return (
    <View style={styles.card}>
      <Text style={styles.header}>NOVA Group {level}</Text>
      <View style={styles.row}>
        <View style={[styles.indicator, { backgroundColor: details.color }]} />
        <Text style={styles.title}>{details.title}</Text>
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
  header: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.s,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.s,
  },
  title: {
    ...theme.typography.body,
    fontWeight: '500',
    flex: 1,
  }
});
