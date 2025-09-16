// api/directus.js - Directus Client Configuration với CORS fix
import { createDirectus, rest, authentication, readItems, createItem, updateItem, deleteItem, uploadFiles } from '@directus/sdk';
import config from '../config';

// Directus instance configuration với proxy support
const getDirectusURL = () => {
  if (process.env.NODE_ENV === 'development') {
    // Trong development, sử dụng proxy để tránh CORS
    return '/api/proxy';
  }
  return config.directus.apiUrl;
};

const DIRECTUS_URL = getDirectusURL();

// Create Directus client
const directus = createDirectus(DIRECTUS_URL)
  .with(authentication('json'))
  .with(rest());

// Current user state
let currentUser = null;
let authToken = null;

/**
 * Directus Client với CORS handling
 */
class DirectusClient {
  constructor() {
    this.client = directus;
    this.isConnected = false;
    this.baseURL = DIRECTUS_URL;
    this.realBaseURL = config.directus.baseUrl; // URL gốc cho assets
  }

  /**
   * Lấy Directus client instance
   */
  getClient() {
    return this.client;
  }

  /**
   * Lấy base URL (có thể là proxy)
   */
  getBaseURL() {
    return this.baseURL;
  }

  /**
   * Lấy real base URL (không proxy) cho assets
   */
  getRealBaseURL() {
    return this.realBaseURL;
  }

  /**
   * Kiểm tra trạng thái kết nối
   */
  isAuthenticated() {
    return !!authToken && this.isConnected;
  }

  /**
   * Lấy token hiện tại
   */
  getToken() {
    return authToken;
  }

  /**
   * Set token manually
   */
  setToken(token) {
    authToken = token;
    this.isConnected = !!token;
    if (token) {
      this.client.setToken(token);
    }
  }

  /**
   * Lấy thông tin user hiện tại
   */
  getCurrentUser() {
    return currentUser;
  }

  /**
   * Set user info
   */
  setCurrentUser(user) {
    currentUser = user;
  }

  /**
   * Clear authentication
   */
  clearAuth() {
    authToken = null;
    currentUser = null;
    this.isConnected = false;
  }

  /**
   * Generic request method với error handling
   */
  async request(operation, options = {}) {
    try {
      const result = await this.client.request(operation);
      return {
        success: true,
        data: result,
        error: null
      };
    } catch (error) {
      console.error('Directus request error:', error);
      
      // Parse error message
      let errorMessage = 'Có lỗi xảy ra';
      
      if (error.response?.data?.errors?.[0]?.message) {
        errorMessage = error.response.data.errors[0].message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Handle specific error codes
      if (error.response?.status === 401) {
        errorMessage = 'Không có quyền truy cập. Vui lòng đăng nhập lại.';
        this.clearAuth();
      } else if (error.response?.status === 403) {
        errorMessage = 'Không có quyền thực hiện thao tác này.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy dữ liệu.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
      }

      return {
        success: false,
        data: null,
        error: {
          message: errorMessage,
          code: error.response?.status || 500,
          details: error
        }
      };
    }
  }

  /**
   * Test connection với CORS handling
   */
  async testConnection() {
    try {
      console.log('🔍 Testing connection to Directus...');
      
      // Thử gọi API server info
      const url = process.env.NODE_ENV === 'development' 
        ? '/api/proxy/server/info' 
        : `${this.baseURL}/server/info`;
        
      const response = await fetch(url);
      
      if (response.ok) {
        const serverInfo = await response.json();
        console.log('✅ Directus connection successful:', serverInfo.data?.directus || 'Connected');
        return {
          success: true,
          serverInfo: serverInfo.data
        };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Directus connection failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Lấy danh sách collections với proxy support
   */
  async getAvailableCollections() {
    try {
      const url = process.env.NODE_ENV === 'development' 
        ? '/api/proxy/collections' 
        : `${this.baseURL}/collections`;
        
      const headers = this.getToken() ? {
        'Authorization': `Bearer ${this.getToken()}`
      } : {};

      const response = await fetch(url, { headers });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          collections: data.data
            .filter(col => !col.meta?.hidden && !col.collection.startsWith('directus_'))
            .map(col => ({
              name: col.collection,
              meta: col.meta,
              schema: col.schema
            }))
        };
      } else {
        return {
          success: false,
          collections: []
        };
      }
    } catch (error) {
      console.log('Cannot fetch system collections:', error.message);
      return {
        success: false,
        collections: []
      };
    }
  }

  /**
   * Helper method để tạo URL cho media files (dùng real URL)
   */
  getFileURL(fileId, options = {}) {
    if (!fileId) return null;
    
    const params = new URLSearchParams();
    
    if (options.width) params.append('width', options.width);
    if (options.height) params.append('height', options.height);
    if (options.quality) params.append('quality', options.quality);
    if (options.format) params.append('format', options.format);
    
    const queryString = params.toString();
    // Sử dụng real URL cho assets
    const url = `${this.realBaseURL}/assets/${fileId}`;
    
    return queryString ? `${url}?${queryString}` : url;
  }

  /**
   * Helper method để format date
   */
  formatDate(dateString, options = {}) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleDateString('vi-VN', { ...defaultOptions, ...options });
  }

  /**
   * Debug method
   */
  debug() {
    console.log('🔧 Directus Client Debug Info:', {
      baseURL: this.baseURL,
      realBaseURL: this.realBaseURL,
      isConnected: this.isConnected,
      hasToken: !!authToken,
      currentUser: currentUser?.email || null,
      isDevelopment: process.env.NODE_ENV === 'development'
    });
  }
}

// Export singleton instance
const directusClient = new DirectusClient();

export default directusClient;