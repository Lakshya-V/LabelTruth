import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';

interface Props {
  alert: string;
}

export const GreenwashingAlertCard = ({ alert }: Props) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Feather name="alert-triangle" size={16} color={theme.colors.semantic.amber} />
        <Text style={styles.title}>Greenwashing Alert</Text>
      </View>
      <Text style={styles.body}>{alert}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.semantic.amber + '18',
    borderRadius: theme.radii.card,
    padding: theme.spacing.l,
    marginVertical: theme.spacing.s,
    borderWidth: 1,
    borderColor: theme.colors.semantic.amber + '40',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s,
    marginBottom: theme.spacing.s,
  },
  title: {
    ...theme.typography.caption,
    color: theme.colors.semantic.amber,
    fontWeight: '700',
  },
  body: {
    ...theme.typography.bodySmall,
    color: theme.colors.textPrimary,
  },
});
