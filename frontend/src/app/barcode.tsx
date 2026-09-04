import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { BarcodeScanningResult, BarcodeType } from 'expo-camera';
import { theme } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';

// Retail product barcode formats to scan for
const BARCODE_TYPES: BarcodeType[] = [
  'ean13',
  'ean8',
  'upc_a',
  'upc_e',
  'code128',
  'code39',
];

export default function BarcodeScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();

  // Guard against firing the navigation multiple times for the same barcode
  const hasScannedRef = useRef(false);

  const handleBarcodeScanned = useCallback(
    (scanningResult: BarcodeScanningResult) => {
      // Already handled a scan — ignore subsequent callbacks
      if (hasScannedRef.current) return;
      hasScannedRef.current = true;

      const { data } = scanningResult;

      // Navigate to analyzing, passing the barcode value so we can process it
      // using our scanService (which checks cache then backend)
      router.replace({
        pathname: '/analyzing',
        params: { mode: 'barcode', barcode: data },
      });
    },
    [router],
  );

  // Development-only fallback — kept as a visually secondary option
  const handleSimulateScan = useCallback(() => {
    if (hasScannedRef.current) return;
    hasScannedRef.current = true;
    router.replace({ pathname: '/analyzing', params: { mode: 'barcode', barcode: '8901030940381' } });
  }, [router]);

  // ─── Permission: loading ───────────────────────────────────────────────────
  if (!permission) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FFF" />
        </View>
      </SafeAreaView>
    );
  }

  // ─── Permission: denied ────────────────────────────────────────────────────
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Feather name="x" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Barcode</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.centered}>
          <View style={styles.permissionIcon}>
            <Feather name="camera-off" size={36} color="rgba(255,255,255,0.6)" />
          </View>
          <Text style={styles.permissionTitle}>Camera access is required</Text>
          <Text style={styles.permissionBody}>
            Allow camera access to scan product barcodes.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Permission granted: real camera ──────────────────────────────────────
  return (
    <View style={styles.cameraRoot}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
        onBarcodeScanned={handleBarcodeScanned}
      />

      {/* Overlay content */}
      <SafeAreaView style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {/* Top bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Feather name="x" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Barcode</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Scanning frame */}
        <View style={styles.frameArea}>
          <View style={styles.frame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.frameHint}>Align barcode inside the frame</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.statusText}>Show a product barcode inside the frame</Text>
          <TouchableOpacity style={styles.simulateButton} onPress={handleSimulateScan}>
            <Text style={styles.simulateText}>Simulate scan</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const FRAME_W = 280;
const FRAME_H = 180;
const CORNER = 36;
const CORNER_BORDER = 4;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraRoot: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.m,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...theme.typography.h3,
    color: '#FFF',
  },

  // ─── Permission denied ─────────────────────────────────────────────────────
  permissionIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.l,
  },
  permissionTitle: {
    ...theme.typography.h3,
    color: '#FFF',
    marginBottom: theme.spacing.s,
    textAlign: 'center',
  },
  permissionBody: {
    ...theme.typography.body,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  permissionButton: {
    backgroundColor: '#FFF',
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.xxl,
    borderRadius: theme.radii.pill,
  },
  permissionButtonText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: '#000',
  },

  // ─── Scanner overlay ───────────────────────────────────────────────────────
  frameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: FRAME_W,
    height: FRAME_H,
    position: 'relative',
    marginBottom: theme.spacing.l,
    // Subtle dark tint inside the frame region (the camera shows through)
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: '#FFF',
  },
  topLeft: { top: 0, left: 0, borderTopWidth: CORNER_BORDER, borderLeftWidth: CORNER_BORDER },
  topRight: { top: 0, right: 0, borderTopWidth: CORNER_BORDER, borderRightWidth: CORNER_BORDER },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: CORNER_BORDER, borderLeftWidth: CORNER_BORDER },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_BORDER,
    borderRightWidth: CORNER_BORDER,
  },
  frameHint: {
    ...theme.typography.bodySmall,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },

  // ─── Footer ────────────────────────────────────────────────────────────────
  footer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.l,
  },
  statusText: {
    ...theme.typography.body,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  simulateButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.l,
    borderRadius: theme.radii.pill,
  },
  simulateText: {
    ...theme.typography.bodySmall,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
});
