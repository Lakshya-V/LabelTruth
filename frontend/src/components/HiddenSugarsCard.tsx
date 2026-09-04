import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';

interface Props {
  sugars: string[];
}

export const HiddenSugarsCard = ({ sugars }: Props) => {
  if (!sugars || sugars.length === 0) return null;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Feather name="eye-off" size={20} color={theme.colors.semantic.amber} />
        <Text style={styles.header}>Hidden Sugars</Text>
      </View>
      {sugars.map((sugar, index) => (
        <View key={index} style={styles.itemRow}>
          <View style={styles.bullet} />
          <Text style={styles.text}>{sugar}</Text>
        </View>
      ))}
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
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.semantic.amber,
    marginRight: theme.spacing.s,
  },
  text: {
    ...theme.typography.body,
  }
});
