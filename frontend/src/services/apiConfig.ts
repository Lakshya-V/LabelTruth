/**
 * apiConfig.ts
 *
 * Centralized API configuration for LabelTruth.
 */

// If EXPO_PUBLIC_API_URL is set, use it. Otherwise, default to the local machine IP.
// NOTE: For physical device testing, 127.0.0.1 refers to the device itself.
// Change 192.168.x.x to your development machine's actual local IP address when testing on a real device.
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://1mm1p9jm-8000.inc1.devtunnels.ms';

// Frontend OCR configuration (Expo Go compatible)
// Set EXPO_PUBLIC_OCR_API_KEY in your environment to use your own key.
// Default fallback provided for out-of-the-box hackathon prototype testing.
export const OCR_API_KEY = process.env.EXPO_PUBLIC_OCR_API_KEY || 'K87899142388957';
export const OCR_PROVIDER = process.env.EXPO_PUBLIC_OCR_PROVIDER || 'ocrspace';
