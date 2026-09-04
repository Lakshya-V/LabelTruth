import { mockUser, mockLoginResponse, mockRegisterResponse, mockBarcodeData, mockImageScanData, mockHistory } from './mockData';
import { UserProfile, HistoryEntry } from '../types';

// Let's use simple local state to simulate backend changes during the session
let currentProfile: UserProfile = { ...mockUser };
let currentHistory: HistoryEntry[] = [...mockHistory];

export const mockApi = {
  mockLogin: async (email: string, password: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email || !password) reject(new Error('Email and password required'));
        resolve(mockLoginResponse);
      }, 1000);
    });
  },

  mockRegister: async (email: string, password: string, condition: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email || !password) reject(new Error('Email and password required'));
        currentProfile = {
          user_id: 1,
          email,
          dietary_condition: condition
        };
        resolve(mockRegisterResponse);
      }, 1000);
    });
  },

  mockGetProfile: async () => {
    return new Promise<UserProfile>((resolve) => {
      setTimeout(() => {
        resolve(currentProfile);
      }, 500);
    });
  },

  mockUpdateProfile: async (condition: string) => {
    return new Promise<UserProfile>((resolve) => {
      setTimeout(() => {
        currentProfile.dietary_condition = condition;
        resolve(currentProfile);
      }, 500);
    });
  },

  mockScanBarcode: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockBarcodeData);
      }, 2000);
    });
  },

  mockScanImage: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockImageScanData);
      }, 2000);
    });
  },

  mockGetHistory: async () => {
    return new Promise<HistoryEntry[]>((resolve) => {
      setTimeout(() => {
        resolve(currentHistory);
      }, 500);
    });
  },

  mockDeleteHistory: async (id: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        currentHistory = currentHistory.filter(item => item.id !== id);
        resolve({ success: true });
      }, 300);
    });
  }
};
