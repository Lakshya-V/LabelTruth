import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { UserProfile } from '@/types';
import { storageService } from '@/services/storageService';
import { authService } from '@/services/authService';

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const conditions = ['None', 'Diabetic', 'Hypertension'];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // First try local cache for instant display
      const cached = await storageService.getProfile();
      if (cached) {
        setProfile(cached);
        setLoading(false);
      }

      // Then sync from backend if user has a session
      const session = await storageService.getSession();
      if (session?.userId) {
        try {
          const fresh = await authService.getProfile(session.userId);
          setProfile(fresh);
          await storageService.saveProfile(fresh);
        } catch {
          // If server fetch fails, rely on cached profile
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConditionChange = async (condition: string) => {
    if (!profile) return;

    setUpdating(true);
    // Optimistic update
    const previousProfile = { ...profile };
    const updated = { ...profile, dietary_condition: condition };
    setProfile(updated);
    await storageService.saveProfile(updated);

    try {
      const session = await storageService.getSession();
      if (session?.userId) {
        const serverProfile = await authService.updateProfile(session.userId, condition);
        setProfile(serverProfile);
        await storageService.saveProfile(serverProfile);
      }
    } catch (error) {
      console.error('Failed to update condition:', error);
      setProfile(previousProfile); // Revert on failure
      await storageService.saveProfile(previousProfile);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    const session = await storageService.getSession();
    if (session) {
      // Clear user-specific data
      await storageService.clearHistory(session.userId);
      await storageService.clearProfile(session.userId);
    }
    await storageService.clearSession();
    router.replace('/login');
  };

  if (loading || !profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.iconContainer}>
                <Feather name="mail" size={20} color={theme.colors.textSecondary} />
              </View>
              <Text style={styles.rowText}>{profile.email}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dietary Condition</Text>
          <Text style={styles.sectionDescription}>
            Personalizes your scanning results to highlight specific ingredients of concern.
          </Text>
          <View style={styles.card}>
            {conditions.map((condition, index) => (
              <TouchableOpacity
                key={condition}
                style={[
                  styles.optionRow,
                  index < conditions.length - 1 && styles.borderBottom
                ]}
                onPress={() => handleConditionChange(condition)}
                activeOpacity={0.7}
                disabled={updating}
              >
                <Text style={[
                  styles.optionText,
                  profile.dietary_condition === condition && styles.optionTextSelected
                ]}>{condition}</Text>
                {profile.dietary_condition === condition && (
                  <Feather name="check" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
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
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.s,
  },
  sectionDescription: {
    ...theme.typography.bodySmall,
    marginBottom: theme.spacing.m,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.m,
    borderWidth: 1,
    borderColor: theme.colors.border + '50',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.m,
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
  },
  rowText: {
    ...theme.typography.body,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.m,
    backgroundColor: theme.colors.card,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '50',
  },
  optionText: {
    ...theme.typography.body,
  },
  optionTextSelected: {
    fontWeight: '600',
    color: theme.colors.primary,
  },
  logoutButton: {
    marginTop: 'auto',
    marginBottom: theme.spacing.xxl,
    padding: theme.spacing.m,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  logoutText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.semantic.red,
  }
});
