import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

interface Props {
  ingredients: string | string[];
}

export const IngredientsCard = ({ ingredients }: Props) => {
  const displayIngredients = Array.isArray(ingredients) ? ingredients.join(', ') : ingredients;
  
  return (
    <View style={styles.card}>
      <Text style={styles.header}>Ingredients</Text>
      <Text style={styles.text}>{displayIngredients}</Text>
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
    ...theme.typography.h3,
    marginBottom: theme.spacing.m,
  },
  text: {
    ...theme.typography.body,
  }
});
