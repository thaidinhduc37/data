// api/auth.js - Updated for https://data.o.io/
import directusClient from './directus.js';
import config from '../config/index.js';

class AuthService {
  constructor() {
    this.apiUrl = config.directus.apiUrl;
    this.endpoints = {
      login: '/admin/login',
      logout: '/admin/logout', 
      refresh: '/admin/refresh',
      me: '/admin/me'
    };
  }

  // Helper method for API calls
  async apiCall(endpoint, options = {}) {
    try {
      const url = `${this.apiUrl}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers
      };

      const token = directusClient.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.errors?.[0]?.message || `Request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      return {
        success: false,
        data: null,
        error: { message: error.message }
      };
    }
  }

  async login(email, password) {
    const result = await this.apiCall(this.endpoints.login, {
      method: 'POST',
      body: JSON.stringify({
        email: email.trim(),
        password
      })
    });

    if (result.success === false) return result;

    if (!result.data?.access_token) {
      return {
        success: false,
        error: { message: 'No access token received' }
      };
    }

    const { access_token, refresh_token, expires } = result.data;
    directusClient.setToken(access_token);

    const userInfo = await this.getCurrentUser();
    
    return {
      success: true,
      data: {
        token: access_token,
        refreshToken: refresh_token,
        expires,
        user: userInfo.data
      }
    };
  }

  async logout() {
    if (directusClient.isAuthenticated()) {
      await this.apiCall(this.endpoints.logout, { method: 'POST' });
    }
    
    directusClient.clearAuth();
    return { success: true };
  }

  async getCurrentUser() {
    return await this.apiCall(this.endpoints.me);
  }

  async refreshToken() {
    const result = await this.apiCall(this.endpoints.refresh, {
      method: 'POST'
    });

    if (result.success && result.data?.access_token) {
      directusClient.setToken(result.data.access_token);
    }

    return result;
  }

  isLoggedIn() {
    return directusClient.isAuthenticated();
  }

  getUser() {
    return directusClient.getCurrentUser();
  }
}

export default new AuthService();