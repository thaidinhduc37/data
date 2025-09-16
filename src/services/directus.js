// services/directus.js - Simple Directus client without CORS issues
import config from '../config/index.js';

// Simple client that mimics your working code
const directusClient = {
  baseURL: config.directus.url,
  token: null,

  // Set token
  setToken(token) {
    this.token = token;
    // Store in localStorage for persistence
    if (token) {
      localStorage.setItem('directus_token', token);
    } else {
      localStorage.removeItem('directus_token');
    }
  },

  // Get stored token
  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('directus_token');
    }
    return this.token;
  },

  // Make authenticated request
  async request(endpoint, options = {}) {
    const token = this.getToken();
    const url = `${this.baseURL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const requestOptions = {
      ...options,
      headers
    };
    
    console.log(`🌐 Request: ${options.method || 'GET'} ${url}`);
    
    try {
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.message || 'Request failed'}`);
      }
      
      const data = await response.json();
      console.log(`✅ Response: ${url} - Success`);
      return data;
    } catch (err) {
      console.error(`❌ Request failed: ${url} - ${err.message}`);
      throw err;
    }
  },

  // Login (same as working code)
  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Login failed: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }
      
      const loginData = await response.json();
      
      if (loginData.data?.access_token) {
        this.setToken(loginData.data.access_token);
      }
      
      return loginData;
    } catch (err) {
      console.error('❌ Login error:', err);
      throw err;
    }
  },

  // Get items from collection
  async getItems(collection, options = {}) {
    const params = new URLSearchParams();
    
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    if (options.fields) params.append('fields', Array.isArray(options.fields) ? options.fields.join(',') : options.fields);
    if (options.filter) params.append('filter', JSON.stringify(options.filter));
    if (options.sort) params.append('sort', Array.isArray(options.sort) ? options.sort.join(',') : options.sort);
    
    const queryString = params.toString();
    const endpoint = `/items/${collection}${queryString ? `?${queryString}` : ''}`;
    
    return await this.request(endpoint);
  },

  // Get single item
  async getItem(collection, id, options = {}) {
    const params = new URLSearchParams();
    if (options.fields) params.append('fields', Array.isArray(options.fields) ? options.fields.join(',') : options.fields);
    
    const queryString = params.toString();
    const endpoint = `/items/${collection}/${id}${queryString ? `?${queryString}` : ''}`;
    
    return await this.request(endpoint);
  },

  // Create item
  async createItem(collection, data) {
    return await this.request(`/items/${collection}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Update item
  async updateItem(collection, id, data) {
    return await this.request(`/items/${collection}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  // Delete item
  async deleteItem(collection, id) {
    return await this.request(`/items/${collection}/${id}`, {
      method: 'DELETE'
    });
  },

  // Get current user
  async getCurrentUser() {
    return await this.request('/users/me');
  },

  // Test connection
  async testConnection() {
    try {
      const response = await fetch(`${this.baseURL}/server/info`);
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        throw new Error(`Server returned ${response.status}`);
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
};

// Initialize token from localStorage on import
directusClient.getToken();

export default directusClient;