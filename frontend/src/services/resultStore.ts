import type { ImageScanResult, BarcodeScanResult } from '@/types';

type AnyScanResult = ImageScanResult | BarcodeScanResult;

let latestResult: AnyScanResult | null = null;

export const resultStore = {
  /**
   * Stores the freshly returned scan result in memory.
   */
  setLatestResult(result: AnyScanResult): void {
    console.log('[resultStore] Storing latest scan result for:', (result as any).product_name || (result as any).product_type || 'Result stored');
    latestResult = result;
  },

  /**
   * Retrieves the current in-memory scan result.
   */
  getLatestResult(): AnyScanResult | null {
    console.log('[resultStore] Retrieval requested. Available:', !!latestResult);
    return latestResult;
  },

  /**
   * Clears the latest scan result.
   */
  clearLatestResult(): void {
    latestResult = null;
  },
};
