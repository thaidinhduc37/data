// src/services/directus.js
// Use relative paths to avoid CORS (following useAuth.js and usePosts.js pattern)
class DirectusService {
  constructor() {
    this.token = null;
    // Try to restore token from localStorage
    this.token = localStorage.getItem('directus_access_token');
  }

  // Authenticate with provided credentials
  async login(email, password) {
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.data?.access_token) {
        this.token = data.data.access_token;
        localStorage.setItem('directus_access_token', this.token);
        if (data.data.refresh_token) {
          localStorage.setItem('directus_refresh_token', data.data.refresh_token);
        }
        return { success: true, token: this.token };
      }
      
      return { success: false, error: 'No access token received' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Try to restore session from localStorage
  async restoreSession() {
    const token = localStorage.getItem('directus_access_token');
    if (token) {
      this.token = token;
      
      // Verify token is still valid
      try {
        const response = await fetch('/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          return { success: true, message: 'Session restored' };
        } else {
          // Token expired, try refresh
          return await this.refreshToken();
        }
      } catch (error) {
        return { success: false, error: 'Session restore failed' };
      }
    }
    
    return { success: false, error: 'No saved session' };
  }

  // Refresh token
  async refreshToken() {
    const refreshToken = localStorage.getItem('directus_refresh_token');
    if (!refreshToken) {
      return { success: false, error: 'No refresh token available' };
    }

    try {
      const response = await fetch('/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      if (data.data?.access_token) {
        this.token = data.data.access_token;
        localStorage.setItem('directus_access_token', this.token);
        if (data.data.refresh_token) {
          localStorage.setItem('directus_refresh_token', data.data.refresh_token);
        }
        return { success: true, token: this.token };
      }
      
      return { success: false, error: 'No new access token received' };
    } catch (error) {
      // Clear invalid tokens
      localStorage.removeItem('directus_access_token');
      localStorage.removeItem('directus_refresh_token');
      this.token = null;
      return { success: false, error: error.message };
    }
  }

  // Logout
  async logout() {
    if (this.token) {
      try {
        await fetch('/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
      } catch (error) {
        console.warn('Logout request failed:', error);
      }
    }
    
    this.token = null;
    localStorage.removeItem('directus_access_token');
    localStorage.removeItem('directus_refresh_token');
    return { success: true };
  }

  // Ensure authenticated - try to restore session first
  async ensureAuthenticated() {
    if (this.token) return true;

    // Try to restore from localStorage
    const restoreResult = await this.restoreSession();
    if (restoreResult.success) {
      return true;
    }

    // No valid session
    console.warn('No valid session found. User needs to login.');
    return false;
  }

  // Get headers with auth token
  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // Generic function to get collection data (using relative paths with auto token refresh)
  async getCollection(collectionName, options = {}) {
    try {
      // Ensure we have valid authentication before making request
      const isAuth = await this.ensureAuthenticated();
      if (!isAuth) {
        return {
          success: false,
          data: [],
          error: 'Authentication required'
        };
      }

      const params = new URLSearchParams();
      
      // Add query parameters
      if (options.fields) {
        params.append('fields', Array.isArray(options.fields) ? options.fields.join(',') : options.fields);
      }
      if (options.limit) {
        params.append('limit', options.limit.toString());
      }
      if (options.sort) {
        params.append('sort', Array.isArray(options.sort) ? options.sort.join(',') : options.sort);
      }
      if (options.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          if (typeof value === 'object') {
            Object.entries(value).forEach(([op, val]) => {
              params.append(`filter[${key}][${op}]`, val);
            });
          } else {
            params.append(`filter[${key}]`, value);
          }
        });
      }

      // Use relative path like in usePosts.js
      const url = `/items/${collectionName}${params.toString() ? '?' + params.toString() : ''}`;
      console.log('Fetching from:', url);
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      console.log('Response status:', response.status);

      // Handle token expired error
      if (response.status === 401) {
        const errorText = await response.text();
        console.log('Token expired, attempting refresh...');
        
        // Try to refresh token
        const refreshResult = await this.refreshToken();
        if (refreshResult.success) {
          console.log('Token refreshed, retrying request...');
          // Retry the request with new token
          const retryResponse = await fetch(url, {
            headers: this.getHeaders()
          });
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            return {
              success: true,
              data: retryData.data || [],
              meta: retryData.meta || {}
            };
          }
        }
        
        // If refresh failed, return auth error
        return {
          success: false,
          data: [],
          error: 'Authentication failed - please login again'
        };
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Received data:', data);
      
      return {
        success: true,
        data: data.data || [],
        meta: data.meta || {}
      };
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  // Get single item from collection
  async getItem(collectionName, id, options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.fields) {
        params.append('fields', Array.isArray(options.fields) ? options.fields.join(',') : options.fields);
      }

      const url = `/items/${collectionName}/${id}${params.toString() ? '?' + params.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || null
      };
    } catch (error) {
      console.error(`Error fetching ${collectionName} item:`, error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  }

  // Specific methods for your collections
  async getDonVi(options = {}) {
    return this.getCollection('donvi', {
      sort: ['ten_don_vi', 'ma_don_vi'],
      ...options
    });
  }

  async getNhanVien(options = {}) {
    return this.getCollection('nhanvien', {
      sort: ['ho_ten'],
      ...options
    });
  }

  async getPages(options = {}) {
    return this.getCollection('pages', {
      filter: { status: 'published' },
      sort: ['sort', '-date_created'],
      ...options
    });
  }

  async getPosts(options = {}) {
    return this.getCollection('posts', {
      filter: { status: 'published' },
      sort: ['-date_created'],
      ...options
    });
  }

  // Get page by slug
  async getPageBySlug(slug) {
    const result = await this.getCollection('pages', {
      filter: { slug: slug, status: 'published' },
      limit: 1
    });
    
    if (result.success && result.data.length > 0) {
      return {
        success: true,
        data: result.data[0]
      };
    }
    
    return {
      success: false,
      data: null,
      error: 'Page not found'
    };
  }

  // Filter visible fields (exclude hidden fields)
  filterVisibleFields(item, hiddenFields = ['id', 'date_created', 'date_updated', 'user_created', 'user_updated', 'sort']) {
    if (!item) return {};
    
    const filtered = {};
    Object.keys(item).forEach(key => {
      // Skip hidden fields and fields starting with underscore
      if (!hiddenFields.includes(key) && !key.startsWith('_')) {
        filtered[key] = item[key];
      }
    });
    
    return filtered;
  }

  // Test connection
  async testConnection() {
    try {
      const response = await fetch('/server/info');
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          serverInfo: data.data
        };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
const directusService = new DirectusService();
export default directusService;