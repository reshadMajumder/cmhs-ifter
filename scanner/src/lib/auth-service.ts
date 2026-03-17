'use client';

const API_BASE_URL = 'https://cmhs-ifter-api.vercel.app';

export interface Tokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  message: string;
  tokens: Tokens;
}

export const authService = {
  setTokens(tokens: Tokens) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
    }
  },

  getAccessToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  },

  getRefreshToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refresh_token');
    }
    return null;
  },

  clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  async login(phone: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/accounts/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Login failed');
    }

    const data: LoginResponse = await response.json();
    this.setTokens(data.tokens);
    return data;
  },

  async logout(): Promise<void> {
    const refresh = this.getRefreshToken();
    if (refresh) {
      try {
        await this._requestWithAuth(`${API_BASE_URL}/api/accounts/logout/`, {
          method: 'POST',
          body: JSON.stringify({ refresh })
        });
      } catch (e) {
        // Silently catch logout errors as we still want to clear local state
        console.warn('API logout failed', e);
      }
    }
    this.clearTokens();
  },

  async refreshTokens(): Promise<Tokens> {
    const refresh = this.getRefreshToken();
    if (!refresh) throw new Error('No refresh token available');

    const response = await fetch(`${API_BASE_URL}/api/accounts/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) {
      this.clearTokens();
      throw new Error('Session expired');
    }

    const data = await response.json();
    
    const tokens: Tokens = {
      access: data.access,
      refresh: data.refresh
    };
    
    if (!tokens.access || !tokens.refresh) {
      throw new Error('Invalid token response from server');
    }
    
    this.setTokens(tokens);
    return tokens;
  },

  async _requestWithAuth(url: string, options: RequestInit = {}): Promise<any> {
    let token = this.getAccessToken();
    if (!token) throw new Error('No authentication token');

    const performFetch = async (accessToken: string) => {
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
    };

    let response = await performFetch(token);

    if (response.status === 401) {
      try {
        const newTokens = await this.refreshTokens();
        response = await performFetch(newTokens.access);
      } catch (e) {
        this.clearTokens();
        throw new Error('Authentication expired. Please login again.');
      }
    }

    // Logout endpoint might return 205 or 204 with no body
    if (response.status === 205 || response.status === 204) {
      return { success: true };
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  },

  async checkEntrance(code: string): Promise<any> {
    return this._requestWithAuth(`${API_BASE_URL}/api/ticket/check-entrance/${code}/`, {
      method: 'GET'
    });
  },

  async checkEntranceByPhone(phone: string): Promise<any> {
    return this._requestWithAuth(`${API_BASE_URL}/api/ticket/check-entrance-phone/${phone}/`, {
      method: 'GET'
    });
  },

  async markFoodReceived(code: string): Promise<any> {
    return this._requestWithAuth(`${API_BASE_URL}/api/ticket/mark-food-received/${code}/`, {
      method: 'POST'
    });
  },

  async markFoodReceivedByPhone(phone: string): Promise<any> {
    return this._requestWithAuth(`${API_BASE_URL}/api/ticket/mark-food-received-phone/${phone}/`, {
      method: 'POST'
    });
  }
};