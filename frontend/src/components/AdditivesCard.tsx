import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';

interface Additive {
  name: string;
  risk: string;
  note: string;
}

interface Props {
  additives: Additive[];
}

export const AdditivesCard = ({ additives }: Props) => {
  if (!additives || additives.length === 0) return null;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Feather name="alert-triangle" size={20} color={theme.colors.semantic.amber} />
        <Text style={styles.header}>Flagged Additives</Text>
      </View>
      <View style={styles.list}>
        {additives.map((additive, index) => (
          <View key={index} style={styles.item}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemName}>{additive.name}</Text>
              <Text style={styles.itemRisk}>{additive.risk} Risk</Text>
            </View>
            <Text style={styles.itemNote}>{additive.note}</Text>
          </View>
        ))}
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
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  header: {
    ...theme.typography.h3,
    marginLeft: theme.spacing.s,
  },
  list: {
    gap: theme.spacing.m,
  },
  item: {
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.semantic.amber,
    paddingLeft: theme.spacing.m,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  itemName: {
    ...theme.typography.body,
    fontWeight: '600',
  },
  itemRisk: {
    ...theme.typography.caption,
    color: theme.colors.semantic.amber,
  },
  itemNote: {
    ...theme.typography.bodySmall,
  }
});
