import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';

export default function LabelScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // ─── Take a photo with the live camera ────────────────────────────────────
  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || !isCameraReady || isCapturing) return;

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (photo?.uri) {
        router.push({ pathname: '/photo-preview', params: { uri: photo.uri } });
      }
    } catch (error) {
      console.error('Capture error:', error);
      Alert.alert('Capture failed', 'Unable to take a photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  }, [isCameraReady, isCapturing, router]);

  // ─── Choose from system photo library ─────────────────────────────────────
  const handlePickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.85,
      });

      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        router.push({ pathname: '/photo-preview', params: { uri } });
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Could not open photos', 'Please try again.');
    }
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
          <Text style={styles.headerTitle}>Scan Label</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.centered}>
          <View style={styles.permissionIcon}>
            <Feather name="camera-off" size={36} color="rgba(255,255,255,0.6)" />
          </View>
          <Text style={styles.permissionTitle}>Camera access is required</Text>
          <Text style={styles.permissionBody}>
            Allow camera access to photograph ingredient labels.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Try Again</Text>
          </TouchableOpacity>

          {/* Gallery remains available even without live camera */}
          <TouchableOpacity style={styles.galleryFallback} onPress={handlePickImage}>
            <Feather name="image" size={18} color="rgba(255,255,255,0.6)" />
            <Text style={styles.galleryFallbackText}>Choose from Photos instead</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Permission granted: live camera ──────────────────────────────────────
  return (
    <View style={styles.cameraRoot}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        onCameraReady={() => setIsCameraReady(true)}
      />

      {/* Overlay */}
      <SafeAreaView style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {/* Top bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Feather name="x" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Label</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Frame guide */}
        <View style={styles.frameArea} pointerEvents="none">
          <View style={styles.frameGuide}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.frameInstruction}>
            Position the ingredient list inside the frame
          </Text>
          <Text style={styles.frameHint}>Keep the text flat and in focus</Text>
        </View>

        {/* Footer controls */}
        <View style={styles.footer} pointerEvents="box-none">
          {/* Gallery picker */}
          <TouchableOpacity style={styles.sideButton} onPress={handlePickImage}>
            <Feather name="image" size={24} color="#FFF" />
            <Text style={styles.sideButtonText}>Photos</Text>
          </TouchableOpacity>

          {/* Shutter */}
          <TouchableOpacity
            style={[styles.shutterOuter, (!isCameraReady || isCapturing) && styles.shutterDisabled]}
            onPress={handleCapture}
            disabled={!isCameraReady || isCapturing}
            activeOpacity={0.8}
          >
            {isCapturing ? (
              <ActivityIndicator color="#000" />
            ) : (
              <View style={styles.shutterInner} />
            )}
          </TouchableOpacity>

          {/* Balance spacer */}
          <View style={styles.sideButton} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const CORNER = 32;
const CORNER_BORDER = 3;

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

  // ─── Header ────────────────────────────────────────────────────────────────
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
    marginBottom: theme.spacing.l,
  },
  permissionButtonText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: '#000',
  },
  galleryFallback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s,
  },
  galleryFallbackText: {
    ...theme.typography.bodySmall,
    color: 'rgba(255,255,255,0.6)',
  },

  // ─── Frame guide ───────────────────────────────────────────────────────────
  frameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
  },
  frameGuide: {
    width: '90%',
    aspectRatio: 3 / 2,
    position: 'relative',
    marginBottom: theme.spacing.l,
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: '#FFF',
  },
  topLeft: { top: 0, left: 0, borderTopWidth: CORNER_BORDER, borderLeftWidth: CORNER_BORDER },
  topRight: { top: 0, right: 0, borderTopWidth: CORNER_BORDER, borderRightWidth: CORNER_BORDER },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_BORDER,
    borderLeftWidth: CORNER_BORDER,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_BORDER,
    borderRightWidth: CORNER_BORDER,
  },
  frameInstruction: {
    ...theme.typography.body,
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  frameHint: {
    ...theme.typography.bodySmall,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },

  // ─── Footer ────────────────────────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  sideButton: {
    width: 60,
    alignItems: 'center',
  },
  sideButtonText: {
    ...theme.typography.caption,
    color: '#FFF',
    marginTop: theme.spacing.xs,
    textTransform: 'none',
    fontSize: 12,
  },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterDisabled: {
    opacity: 0.5,
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
  },
});
