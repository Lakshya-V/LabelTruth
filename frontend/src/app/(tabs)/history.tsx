import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { theme } from '@/constants/theme';
import { ScanCard } from '@/components/ScanCard';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { storageService } from '@/services/storageService';
import { resultStore } from '@/services/resultStore';
import { HistoryEntry } from '@/types';

export default function HistoryScreen() {
  const router = useRouter();
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await storageService.getHistory();
      setHistoryData(data);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (id: string | number) => {
    try {
      await storageService.deleteHistoryEntry(id);
      setHistoryData(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to delete history entry:', error);
    }
  };

  const confirmDelete = (id: string | number, name: string) => {
    Alert.alert(
      "Delete Scan",
      `Are you sure you want to delete ${name} from your history?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => handleDelete(id) }
      ]
    );
  };

  const formatDate = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch {
      return isoString;
    }
  };

  const handleItemPress = (item: HistoryEntry) => {
    if (item.resultData) {
      resultStore.setLatestResult(item.resultData);
      router.push({
        pathname: '/result',
        params: {
          mode: item.scanType,
        },
      });
    } else {
      // Fallback for legacy mock history entries
      resultStore.clearLatestResult();
      router.push({ pathname: '/result', params: { mock: item.scanType ?? 'barcode' } });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Scan History</Text>

        {loading ? (
          <ActivityIndicator color={theme.colors.primary} style={{ marginTop: theme.spacing.xl }} />
        ) : historyData.length > 0 ? (
          <FlatList
            data={historyData}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.itemContainer}>
                <View style={{ flex: 1 }}>
                  <ScanCard
                    name={item.productName || item.name || 'Unknown'}
                    score={item.score ?? 0}
                    badgeColor={item.badgeColor}
                    date={item.scannedAt ? formatDate(item.scannedAt) : item.date ?? ''}
                    onPress={() => handleItemPress(item)}
                  />
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => confirmDelete(item.id, item.productName || item.name || 'this item')}
                >
                  <Feather name="trash-2" size={20} color={theme.colors.semantic.red} />
                </TouchableOpacity>
              </View>
            )}
          />
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Feather name="clock" size={32} color={theme.colors.textLight} />
            </View>
            <Text style={styles.emptyTitle}>No scans yet</Text>
            <Text style={styles.emptyText}>Your scan history will appear here.</Text>
          </View>
        )}
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
  title: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.l,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  deleteButton: {
    padding: theme.spacing.m,
    marginLeft: theme.spacing.s,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.m,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
    ...theme.shadows.subtle,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: '20%',
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.xs,
  },
  emptyText: {
    ...theme.typography.bodySmall,
    textAlign: 'center',
  }
});
