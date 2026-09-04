import { API_BASE_URL } from './apiConfig';
import { storageService } from './storageService';
import type { UserProfile } from '@/types';

export interface LoginResponse {
  status: string;
  user_id: number;
  email: string;
  dietary_condition?: string;
}

export interface RegisterResponse {
  status?: string;
  user_id?: number;
  email?: string;
  dietary_condition?: string;
  message?: string;
}

export const authService = {
  /**
   * Authenticates with POST /auth/login.
   * Stores the session and profile upon success.
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const detail = errorBody?.detail;
      if (typeof detail === 'string') {
        throw new Error(detail);
      } else if (Array.isArray(detail)) {
        throw new Error(detail.map((e: any) => e.msg || 'Invalid field').join(', '));
      }
      throw new Error(`Login failed with status ${response.status}`);
    }

    const data = (await response.json()) as LoginResponse;

    // Persist session and profile
    if (data.user_id) {
      await storageService.saveSession({
        userId: data.user_id,
        email: data.email || email,
      });

      await storageService.saveProfile({
        user_id: data.user_id,
        email: data.email || email,
        dietary_condition: data.dietary_condition || 'None',
      });
    }

    return data;
  },

  /**
   * Registers a new account with POST /auth/register.
   */
  async register(email: string, password: string, condition: string): Promise<RegisterResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        password,
        dietary_condition: condition,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const detail = errorBody?.detail;
      if (typeof detail === 'string') {
        throw new Error(detail);
      } else if (Array.isArray(detail)) {
        throw new Error(detail.map((e: any) => e.msg || 'Invalid field').join(', '));
      }
      throw new Error(`Registration failed with status ${response.status}`);
    }

    const data = (await response.json()) as RegisterResponse;

    if (data.user_id) {
      await storageService.saveSession({
        userId: data.user_id,
        email: data.email || email,
      });

      await storageService.saveProfile({
        user_id: data.user_id,
        email: data.email || email,
        dietary_condition: data.dietary_condition || condition,
      });
    }

    return data;
  },

  /**
   * Fetches user profile from GET /user/profile/{user_id}.
   */
  async getProfile(userId: number): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/user/profile/${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.status}`);
    }
    return response.json();
  },

  /**
   * Updates user dietary condition with PUT /user/profile/{user_id}.
   */
  async updateProfile(userId: number, condition: string): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/user/profile/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dietary_condition: condition }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update profile: ${response.status}`);
    }

    const updated = (await response.json()) as UserProfile;
    await storageService.saveProfile(updated);
    return updated;
  },
};
