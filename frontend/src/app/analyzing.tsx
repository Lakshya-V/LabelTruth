import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '@/constants/theme';
import type { ScanMode } from '@/types';
import { scanLabelImage, scanBarcode } from '@/services/scanService';
import { storageService } from '@/services/storageService';
import { resultStore } from '@/services/resultStore';

const STAGES_BARCODE = [
  'Looking up product...',
  'Reading ingredients...',
  'Checking additives & E-numbers...',
  'Evaluating NOVA processing...',
];

const STAGES_IMAGE = [
  'Reading ingredients...',
  'Checking additives & E-numbers...',
  'Evaluating NOVA processing...',
  'Reviewing marketing claims...',
];

export default function AnalyzingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    mode?: ScanMode;
    mock?: string; // legacy compat
    imageUri?: string;
    barcode?: string;
    productName?: string;
  }>();

  const mode: ScanMode = params.mode ?? (params.mock === 'image' ? 'image' : 'barcode');
  const imageUri = params.imageUri ?? '';
  const barcode = params.barcode ?? '';
  const productName = params.productName ?? '';

  const stages = mode === 'image' ? STAGES_IMAGE : STAGES_BARCODE;
  const [currentStage, setCurrentStage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // We only want to execute the scan once
  const scanned = useRef(false);

  useEffect(() => {
    // Stage transition visual effect (independent of actual scan progress)
    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 1500);

    return () => clearInterval(stageInterval);
  }, [stages.length]);

  useEffect(() => {
    if (scanned.current) return;
    scanned.current = true;

    async function performScan() {
      try {
        const session = await storageService.getSession();
        const userId = session?.userId;
        
        let resultData;
        if (mode === 'image') {
          if (!imageUri) throw new Error("No image selected");
          resultData = await scanLabelImage({ imageUri, userId, productName });
        } else {
          if (!barcode) throw new Error("No barcode provided");
          resultData = await scanBarcode({ barcode, userId });
        }

        resultStore.setLatestResult(resultData);

        console.log('navigation to /result');
        router.replace({
          pathname: '/result',
          params: {
            mode,
            barcode,
            imageUri,
          },
        });
      } catch (err: any) {
        console.error("Scan error:", err);
        setError(err.message || 'An unknown error occurred.');
      }
    }

    performScan();
  }, [mode, barcode, imageUri, productName, router]);

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.errorTitle}>Analysis Failed</Text>
          <Text style={styles.errorText}>{error}</Text>
          
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.retryText}>Retake / Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.spinnerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
        <Text style={styles.stageText}>{stages[currentStage]}</Text>
        <Text style={styles.subText}>
          {mode === 'image'
            ? 'Analyzing label photograph'
            : 'Looking up product information'}
        </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  spinnerContainer: {
    marginBottom: theme.spacing.xl,
  },
  stageText: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.s,
  },
  subText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  errorTitle: {
    ...theme.typography.h2,
    color: theme.colors.semantic.red,
    marginBottom: theme.spacing.m,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radii.pill,
  },
  retryText: {
    ...theme.typography.body,
    color: '#FFF',
    fontWeight: '600',
  }
});
