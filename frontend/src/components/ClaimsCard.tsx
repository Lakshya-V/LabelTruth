import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';

interface Props {
  claims: string[];
}

export const ClaimsCard = ({ claims }: Props) => {
  if (!claims || claims.length === 0) return null;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Feather name="shield" size={20} color={theme.colors.primary} />
        <Text style={styles.header}>Marketing Claims</Text>
      </View>
      {claims.map((claim, index) => (
        <View key={index} style={styles.itemRow}>
          <Feather name="check-circle" size={16} color={theme.colors.textLight} />
          <Text style={styles.text}>{claim}</Text>
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
  text: {
    ...theme.typography.body,
    marginLeft: theme.spacing.s,
    flex: 1,
  }
});
