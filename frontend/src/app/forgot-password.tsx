import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.eyebrow}>ACCOUNT ACCESS</Text>
          <Text style={styles.title}>Password Recovery</Text>
          <Text style={styles.subtitle}>
            Need help signing into your LabelTruth account?
          </Text>

          <View style={styles.infoCard}>
            <View style={styles.iconRow}>
              <View style={styles.iconCircle}>
                <Feather name="info" size={22} color={theme.colors.primary} />
              </View>
              <Text style={styles.cardHeader}>Feature Unavailable</Text>
            </View>
            <Text style={styles.cardBody}>
              Self-service password recovery is not yet supported by the authentication backend.
            </Text>
            <Text style={styles.cardDetail}>
              If you have lost access to your account, please create a new account with your preferred dietary condition, or contact your administrator.
            </Text>
          </View>
        </View>

        {/* Footer actions */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Return to Log In</Text>
          </TouchableOpacity>

          <View style={styles.linkRow}>
            <Text style={styles.footerText}>Need a new account? </Text>
            <TouchableOpacity onPress={() => router.replace('/register')}>
              <Text style={styles.linkText}>Create one</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.m,
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
    marginBottom: theme.spacing.s,
  },
  title: {
    ...theme.typography.h1,
    lineHeight: 40,
    marginBottom: theme.spacing.s,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  infoCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.card,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.subtle,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
    gap: theme.spacing.s,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeader: {
    ...theme.typography.h3,
    fontSize: 18,
  },
  cardBody: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.m,
    lineHeight: 22,
  },
  cardDetail: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.l,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.pill,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...theme.typography.body,
    color: '#FFF',
    fontWeight: '600',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  linkText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
