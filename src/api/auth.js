// api/auth.js - Authentication Functions
import directusClient from './directus.js';
import config from '../config/index.js';

class AuthService {
  async login(email, password) {
    try {
      console.log('Attempting login...');

      // Sử dụng apiUrl từ config (có CORS proxy trong dev)
      const loginUrl = `${config.directus.apiUrl}/admin/login`;
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.errors?.[0]?.message || 
                           `Login failed: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const loginData = await response.json();
      
      if (!loginData.data?.access_token) {
        throw new Error('No access token received from server');
      }

      const { access_token, refresh_token, expires } = loginData.data;
      
      directusClient.setToken(access_token);
      
      const userInfo = await this.getCurrentUser();
      
      console.log('Login successful');
      
      return {
        success: true,
        data: {
          token: access_token,
          refreshToken: refresh_token,
          expires: expires,
          user: userInfo.data
        },
        error: null
      };

    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        data: null,
        error: {
          message: error.message,
          details: error
        }
      };
    }
  }

  async logout() {
    try {
      if (directusClient.isAuthenticated()) {
        const logoutUrl = `${config.directus.apiUrl}/auth/logout`;
        await fetch(logoutUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${directusClient.getToken()}`
          }
        });
      }
      
      directusClient.clearAuth();
      console.log('Logout successful');
      
      return {
        success: true,
        data: null,
        error: null
      };
    } catch (error) {
      directusClient.clearAuth();
      return {
        success: false,
        data: null,
        error: {
          message: error.message,
          details: error
        }
      };
    }
  }

  async getCurrentUser() {
    try {
      const userUrl = `${config.directus.apiUrl}/users/me`;
      const response = await fetch(userUrl, {
        headers: {
          'Authorization': `Bearer ${directusClient.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.status}`);
      }

      const userData = await response.json();
      directusClient.setCurrentUser(userData.data);
      
      return {
        success: true,
        data: userData.data,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: {
          message: error.message,
          details: error
        }
      };
    }
  }

  async refreshToken() {
    try {
      const refreshUrl = `${config.directus.apiUrl}/auth/refresh`;
      const response = await fetch(refreshUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${directusClient.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      directusClient.setToken(data.data.access_token);
      
      return {
        success: true,
        data: data.data,
        error: null
      };
    } catch (error) {
      directusClient.clearAuth();
      return {
        success: false,
        data: null,
        error: {
          message: error.message,
          details: error
        }
      };
    }
  }

  isLoggedIn() {
    return directusClient.isAuthenticated();
  }

  getUser() {
    return directusClient.getCurrentUser();
  }
}

const authService = new AuthService();
export default authService;