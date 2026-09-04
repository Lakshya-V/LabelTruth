import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';

export default function PhotoPreviewScreen() {
  const router = useRouter();
  const { uri } = useLocalSearchParams<{ uri: string }>();

  const handleRetake = () => {
    // Go back to the label camera
    router.back();
  };

  const handleAnalyze = () => {
    // Navigate to the product name screen before analyzing.
    // The product-name screen will then navigate to /analyzing with both imageUri and productName.
    router.push({
      pathname: '/product-name',
      params: { imageUri: uri ?? '' },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleRetake}>
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preview</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Image */}
      <View style={styles.imageContainer}>
        {uri ? (
          <Image source={{ uri }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={styles.noImage}>
            <Feather name="image" size={48} color="rgba(255,255,255,0.3)" />
            <Text style={styles.noImageText}>No image found</Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
          <Text style={styles.retakeText}>Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.analyzeButton, !uri && styles.analyzeDisabled]}
          onPress={handleAnalyze}
          disabled={!uri}
          activeOpacity={0.85}
        >
          <Text style={styles.analyzeText}>Analyze Label</Text>
          <Feather name="arrow-right" size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
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
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    alignItems: 'center',
    gap: theme.spacing.m,
  },
  noImageText: {
    ...theme.typography.body,
    color: 'rgba(255,255,255,0.4)',
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  retakeButton: {
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
  },
  retakeText: {
    ...theme.typography.body,
    color: '#FFF',
    fontWeight: '600',
  },
  analyzeButton: {
    backgroundColor: '#FFF',
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s,
  },
  analyzeDisabled: {
    opacity: 0.4,
  },
  analyzeText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: '#000',
  },
});
