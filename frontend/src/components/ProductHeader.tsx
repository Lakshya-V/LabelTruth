import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

interface Props {
  name: string;
  source: string;
}

export const ProductHeader = ({ name, source }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.source}>{source}</Text>
      <Text style={styles.name}>{name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.l,
    marginTop: theme.spacing.m,
  },
  source: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  name: {
    ...theme.typography.h1,
  }
});
