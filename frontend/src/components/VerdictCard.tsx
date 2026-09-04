import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';

interface Props {
  verdict: string;
}

export const VerdictCard = ({ verdict }: Props) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Feather name="check-circle" size={20} color="#FFF" />
        <Text style={styles.header}>Verdict</Text>
      </View>
      <Text style={styles.text}>{verdict}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.primary,
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
    color: '#FFF',
    marginLeft: theme.spacing.s,
  },
  text: {
    ...theme.typography.body,
    color: '#FFF',
    opacity: 0.9,
  }
});
