
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import { ScanCard } from '@/components/ScanCard';
import { HistoryEntry, UserProfile } from '@/types';
import { storageService } from '@/services/storageService';
import { resultStore } from '@/services/resultStore';
import { authService } from '@/services/authService';


export default function HomeScreen() {
  const router = useRouter();
  const [recentScans, setRecentScans] = useState<HistoryEntry[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const scans = await storageService.getHistory();
      setRecentScans(scans.slice(0, 3)); // Only show top 3 recent scans

      let userProfile = await storageService.getProfile();
      const session = await storageService.getSession();
      if (session?.userId) {
        try {
          const fresh = await authService.getProfile(session.userId);
          userProfile = fresh;
          await storageService.saveProfile(fresh);
        } catch {
          // Keep cached profile if offline
        }
      }
      setProfile(userProfile);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      await fetchData();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello there,</Text>
          <Text style={styles.title}>What are we scanning today?</Text>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryAction]}
            onPress={() => router.push('/barcode')}
            activeOpacity={0.8}
          >
            <View style={styles.iconWrapper}>
              <Feather name="maximize" size={32} color="#FFF" />
            </View>
            <Text style={styles.actionTitlePrimary}>Scan Barcode</Text>
            <Text style={styles.actionSubtitlePrimary}>Quick lookup</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryAction]}
            onPress={() => router.push('/label')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconWrapper, styles.secondaryIconWrapper]}>
              <Feather name="camera" size={32} color={theme.colors.primary} />
            </View>
            <Text style={styles.actionTitleSecondary}>Scan Label</Text>
            <Text style={styles.actionSubtitleSecondary}>Analyze ingredients</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Scans</Text>
            <TouchableOpacity onPress={() => router.push('/history')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={theme.colors.primary} style={{ marginTop: theme.spacing.xl }} />
          ) : recentScans.length > 0 ? (
            recentScans.map((scan) => (
              <ScanCard
                key={String(scan.id)}
                name={scan.productName ?? scan.name ?? 'Unknown'}
                score={scan.score ?? 0}
                badgeColor={scan.badgeColor}
                date={scan.scannedAt ? new Date(scan.scannedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : (scan.date ?? '')}
                onPress={() => {
                  if (scan.resultData) {
                    resultStore.setLatestResult(scan.resultData);
                    router.push({
                      pathname: '/result',
                      params: {
                        mode: scan.scanType,
                      },
                    });
                  } else {
                    resultStore.clearLatestResult();
                    router.push({ pathname: '/result', params: { mock: scan.scanType ?? 'barcode' } });
                  }
                }}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No scans yet.</Text>
              <Text style={styles.emptySubText}>Products you analyze will appear here.</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  content: {
    padding: theme.spacing.l,
    paddingTop: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  greeting: {
    ...theme.typography.h3,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  title: {
    ...theme.typography.h1,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: theme.spacing.m,
    marginBottom: theme.spacing.xxl,
  },
  actionButton: {
    flex: 1,
    padding: theme.spacing.l,
    borderRadius: theme.radii.card,
    ...theme.shadows.subtle,
  },
  primaryAction: {
    backgroundColor: theme.colors.primary,
  },
  secondaryAction: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconWrapper: {
    marginBottom: theme.spacing.m,
  },
  secondaryIconWrapper: {
    opacity: 0.9,
  },
  actionTitlePrimary: {
    ...theme.typography.h3,
    color: '#FFF',
    marginBottom: theme.spacing.xs,
  },
  actionSubtitlePrimary: {
    ...theme.typography.bodySmall,
    color: '#FFF',
    opacity: 0.8,
  },
  actionTitleSecondary: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  actionSubtitleSecondary: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  recentSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  sectionTitle: {
    ...theme.typography.h3,
  },
  seeAll: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  emptyState: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.m,
  },
  emptyText: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.xs,
  },
  emptySubText: {
    ...theme.typography.bodySmall,
    textAlign: 'center',
  }
});
