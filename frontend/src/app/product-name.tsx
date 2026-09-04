import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';

export default function ProductNameScreen() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [name, setName] = useState('');
  const inputRef = useRef<TextInput>(null);

  const trimmedName = name.trim();
  const canContinue = trimmedName.length > 0;

  const handleContinue = () => {
    if (!canContinue) return;
    router.replace({
      pathname: '/analyzing',
      params: {
        mode: 'image',
        imageUri: imageUri ?? '',
        productName: trimmedName,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.eyebrow}>ONE LAST THING</Text>
          <Text style={styles.heading}>What product are{'\n'}you scanning?</Text>
          <Text style={styles.subtitle}>
            Enter the product name so we can save it correctly in your scan history.
          </Text>

          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="e.g. Lay's Magic Masala"
            placeholderTextColor={theme.colors.textLight}
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleContinue}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueButton, !canContinue && styles.continueDisabled]}
            onPress={handleContinue}
            disabled={!canContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.continueText}>Continue</Text>
            <Feather name="arrow-right" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.m,
    paddingTop: theme.spacing.s,
    paddingBottom: theme.spacing.xs,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.subtle,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
  },
  eyebrow: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    marginBottom: theme.spacing.m,
  },
  heading: {
    ...theme.typography.h1,
    lineHeight: 40,
    marginBottom: theme.spacing.m,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.m,
    padding: theme.spacing.m,
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
    paddingTop: theme.spacing.m,
  },
  continueButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.pill,
    paddingVertical: theme.spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.s,
    height: 56,
  },
  continueDisabled: {
    opacity: 0.4,
  },
  continueText: {
    ...theme.typography.body,
    color: '#FFF',
    fontWeight: '600',
  },
});
