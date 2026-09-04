import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';

interface Props {
  warning: string;
}

export const WarningCard = ({ warning }: Props) => {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Feather name="alert-circle" size={20} color={theme.colors.semantic.amber} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Personalized Consideration</Text>
        <Text style={styles.warning}>{warning}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.card,
    padding: theme.spacing.m,
    marginVertical: theme.spacing.s,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: theme.colors.semantic.amber + '40', // 25% opacity
  },
  iconContainer: {
    marginRight: theme.spacing.m,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  warning: {
    ...theme.typography.bodySmall,
  }
});
