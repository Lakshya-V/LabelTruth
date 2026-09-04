import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryEntry, ImageScanResult, BarcodeScanResult, UserProfile } from '@/types';

// Storage keys
const KEYS = {
  HISTORY: (userId: number) => `@labeltruth/history_${userId}`,
  PROFILE: (userId: number) => `@labeltruth/profile_${userId}`,
  /**
   * Product cache key is scoped by BOTH barcode AND user identity/profile context.
   *
   * Why: The backend personalizes barcode results based on the user's dietary
   * condition (e.g., Diabetic gets different personalized_warning than Hypertension).
   * A global barcode-only cache would allow User A's personalized result to be
   * returned to User B — which is incorrect and a privacy concern.
   *
   * Key format:
   *   Authenticated user:  @labeltruth/product_{barcode}_{userContext}
   *   Anonymous session:   @labeltruth/product_{barcode}_anon
   *
   * Anonymous results are NEVER returned to authenticated users.
   * Authenticated results are NEVER shared across different userIds or dietary conditions.
   * Changing dietary condition bypasses the cache because the userContext string changes,
   * triggering a fresh network request to get the newly personalized result.
   */
  PRODUCT: (barcode: string, userContext: string) =>
    `@labeltruth/product_${barcode}_${userContext}`,
  SESSION: '@labeltruth/session',
  /**
   * Index of all cached product keys so we can enforce the MAX_CACHED_PRODUCTS
   * limit without scanning every AsyncStorage key.
   */
  PRODUCT_INDEX: '@labeltruth/product_index',
};

const MAX_HISTORY_ENTRIES = 100;
const MAX_CACHED_PRODUCTS = 100;

export type SessionData = {
  userId: number;
  email: string;
};

export const storageService = {
  // Session
  async getSession(): Promise<SessionData | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SESSION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async saveSession(session: SessionData): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SESSION, JSON.stringify(session));
    } catch (e) {
      console.warn('Failed to save session', e);
    }
  },

  async clearSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.SESSION);
    } catch (e) {
      console.warn('Failed to clear session', e);
    }
  },

  // Profile
  async getProfile(): Promise<UserProfile | null> {
    try {
      const session = await this.getSession();
      if (!session) return null;
      const data = await AsyncStorage.getItem(KEYS.PROFILE(session.userId));
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async saveProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.PROFILE(profile.user_id), JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save profile', e);
    }
  },

  async clearProfile(userId: number): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.PROFILE(userId));
    } catch (e) {
      console.warn('Failed to clear profile', e);
    }
  },

  // History
  async getHistory(): Promise<HistoryEntry[]> {
    try {
      const session = await this.getSession();
      if (!session) return [];
      const data = await AsyncStorage.getItem(KEYS.HISTORY(session.userId));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveHistory(history: HistoryEntry[]): Promise<void> {
    try {
      const session = await this.getSession();
      if (!session) return;
      await AsyncStorage.setItem(KEYS.HISTORY(session.userId), JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save history', e);
    }
  },

  async addHistoryEntry(entry: HistoryEntry): Promise<void> {
    try {
      const history = await this.getHistory();
      // Remove any existing entry for same id just in case
      let newHistory = history.filter((h) => h.id !== entry.id);
      newHistory.unshift(entry);
      
      // Limit to max entries
      if (newHistory.length > MAX_HISTORY_ENTRIES) {
        newHistory = newHistory.slice(0, MAX_HISTORY_ENTRIES);
      }
      
      await this.saveHistory(newHistory);
    } catch (e) {
      console.warn('Failed to add history entry', e);
    }
  },

  async deleteHistoryEntry(id: string | number): Promise<void> {
    try {
      const history = await this.getHistory();
      const newHistory = history.filter((h) => h.id !== id);
      await this.saveHistory(newHistory);
    } catch (e) {
      console.warn('Failed to delete history entry', e);
    }
  },

  async clearHistory(userId: number): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.HISTORY(userId));
    } catch (e) {
      console.warn('Failed to clear history', e);
    }
  },

  // Product Cache
  //
  // Cache keys are scoped to (barcode, userContext) to prevent cross-user
  // personalization leakage. See KEYS.PRODUCT for full rationale.
  async getCachedProduct(
    barcode: string,
    userContext: string,
  ): Promise<BarcodeScanResult | null> {
    try {
      const key = KEYS.PRODUCT(barcode, userContext);
      const data = await AsyncStorage.getItem(key);
      return data ? (JSON.parse(data) as BarcodeScanResult) : null;
    } catch {
      return null;
    }
  },

  async saveCachedProduct(
    barcode: string,
    userContext: string,
    result: BarcodeScanResult,
  ): Promise<void> {
    try {
      const key = KEYS.PRODUCT(barcode, userContext);
      await AsyncStorage.setItem(key, JSON.stringify(result));

      // Maintain the product index for enforcing the size limit
      await this._addToProductIndex(key);
    } catch (e) {
      console.warn('Failed to save cached product', e);
    }
  },

  // Internal: maintain a list of all product cache keys so we can prune old ones
  async _addToProductIndex(newKey: string): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.PRODUCT_INDEX);
      let index: string[] = raw ? JSON.parse(raw) : [];

      // Remove duplicate if it already exists (re-scan updates in place)
      index = index.filter((k) => k !== newKey);
      index.push(newKey); // Most recent last

      if (index.length > MAX_CACHED_PRODUCTS) {
        // Evict the oldest entries
        const toEvict = index.splice(0, index.length - MAX_CACHED_PRODUCTS);
        await AsyncStorage.multiRemove(toEvict);
      }

      await AsyncStorage.setItem(KEYS.PRODUCT_INDEX, JSON.stringify(index));
    } catch (e) {
      console.warn('Failed to update product index', e);
    }
  },
};
