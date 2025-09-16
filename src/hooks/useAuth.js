// hooks/useAuth.js - Based on Directus Guest Authoring approach
import { useState, useEffect, useCallback } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Directus configuration (use relative paths for proxy)
  const LOGIN_EMAIL = 'admin@o.io';
  const LOGIN_PASSWORD = '12345';

  // Create Directus client
  const createDirectusAuth = () => {
    return {
      async login(email, password) {
        try {
          const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              password,
            }),
          });

          if (!response.ok) {
            throw new Error(`Authentication failed: ${response.statusText}`);
          }

          const data = await response.json();
          if (!data.data?.access_token) {
            throw new Error('No access token received');
          }
          return data;
        } catch (err) {
          throw err;
        }
      },

      async logout() {
        const token = localStorage.getItem('directus_access_token');
        if (token) {
          try {
            await fetch('/auth/logout', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
          } catch (err) {
            console.warn('Logout request failed:', err);
          }
        }
        localStorage.removeItem('directus_access_token');
        localStorage.removeItem('directus_refresh_token');
      },

      async refresh() {
        const refreshToken = localStorage.getItem('directus_refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await fetch('/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh_token: refreshToken,
          }),
        });

        if (!response.ok) {
          throw new Error('Token refresh failed');
        }

        const data = await response.json();
        if (!data.data?.access_token) {
          throw new Error('No new access token received');
        }
        return data;
      },

      async me() {
        const token = localStorage.getItem('directus_access_token');
        if (!token) {
          throw new Error('No access token available');
        }

        const response = await fetch('/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        return response.json();
      },
    };
  };

  const auth = createDirectusAuth();

  // Check existing session
  const checkExistingSession = useCallback(async () => {
    const token = localStorage.getItem('directus_access_token');
    if (!token) return false;

    try {
      const userData = await auth.me();
      setUser(userData.data);
      setIsLoggedIn(true);
      return true;
    } catch (err) {
      console.log('Existing session invalid, attempting refresh...');
      try {
        const refreshData = await auth.refresh();
        localStorage.setItem('directus_access_token', refreshData.data.access_token);
        if (refreshData.data.refresh_token) {
          localStorage.setItem('directus_refresh_token', refreshData.data.refresh_token);
        }
        const userData = await auth.me();
        setUser(userData.data);
        setIsLoggedIn(true);
        return true;
      } catch (refreshErr) {
        console.log('Token refresh failed:', refreshErr);
        localStorage.removeItem('directus_access_token');
        localStorage.removeItem('directus_refresh_token');
        return false;
      }
    }
  }, []);

  // Login function
  const login = useCallback(async (email = LOGIN_EMAIL, password = LOGIN_PASSWORD) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Attempting login with Directus API...');
      const response = await auth.login(email, password);

      localStorage.setItem('directus_access_token', response.data.access_token);
      if (response.data.refresh_token) {
        localStorage.setItem('directus_refresh_token', response.data.refresh_token);
      }

      const userData = await auth.me();
      setUser(userData.data);
      setIsLoggedIn(true);

      console.log('Login successful');
      return { success: true, data: response.data, user: userData.data };
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.message || 'Đăng nhập thất bại';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await auth.logout();
      setUser(null);
      setIsLoggedIn(false);
      setError(null);
      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-login for development
  const autoLogin = useCallback(async () => {
    if (isLoggedIn) return;

    console.log('Attempting auto-login...');
    await login();
  }, [isLoggedIn, login]);

  // Initialize
  useEffect(() => {
    const initAuth = async () => {
      const hasExistingSession = await checkExistingSession();
      if (!hasExistingSession) {
        await autoLogin();
      }
    };
    initAuth();
  }, [checkExistingSession, autoLogin]);

  return {
    user,
    isLoggedIn,
    isLoading,
    error,
    login,
    logout,
    clearError: () => setError(null),
  };
};