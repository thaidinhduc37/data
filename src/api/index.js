// api/index.js - API wrapper without CORS issues
import directusClient from '../services/directus.js';

const api = {
  // Auth endpoints
  auth: {
    async login(email, password) {
      try {
        const result = await directusClient.login(email, password);
        
        if (result.data?.access_token) {
          return {
            success: true,
            data: {
              token: result.data.access_token,
              user: result.data.user || {},
              expires: result.data.expires || null
            }
          };
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        return {
          success: false,
          error: { message: err.message }
        };
      }
    },

    async logout() {
      try {
        const token = directusClient.getToken();
        if (token) {
          // Try to logout from server
          try {
            await directusClient.request('/auth/logout', { method: 'POST' });
          } catch (err) {
            console.log('Server logout failed:', err);
          }
        }
        
        directusClient.setToken(null);
        
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: { message: err.message }
        };
      }
    },

    async getCurrentUser() {
      try {
        const result = await directusClient.getCurrentUser();
        return {
          success: true,
          data: result.data
        };
      } catch (err) {
        return {
          success: false,
          error: { message: err.message }
        };
      }
    },

    isLoggedIn() {
      return !!directusClient.getToken();
    }
  },

  // Posts endpoints
  posts: {
    async getAll(options = {}) {
      try {
        const result = await directusClient.getItems('posts', {
          limit: options.limit || 50,
          offset: options.offset || 0,
          fields: options.fields || ['*'],
          sort: options.sort || ['-date_created'],
          filter: options.filter || {}
        });
        
        return {
          success: true,
          data: result.data || [],
          meta: result.meta || {}
        };
      } catch (err) {
        return {
          success: false,
          error: { message: err.message }
        };
      }
    },

    async get(id, options = {}) {
      try {
        const result = await directusClient.getItem('posts', id, {
          fields: options.fields || ['*']
        });
        
        return {
          success: true,
          data: result.data
        };
      } catch (err) {
        return {
          success: false,
          error: { message: err.message }
        };
      }
    },

    async create(data) {
      try {
        const result = await directusClient.createItem('posts', data);
        
        return {
          success: true,
          data: result.data
        };
      } catch (err) {
        return {
          success: false,
          error: { message: err.message }
        };
      }
    },

    async update(id, data) {
      try {
        const result = await directusClient.updateItem('posts', id, data);
        
        return {
          success: true,
          data: result.data
        };
      } catch (err) {
        return {
          success: false,
          error: { message: err.message }
        };
      }
    },

    async delete(id) {
      try {
        await directusClient.deleteItem('posts', id);
        
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: { message: err.message }
        };
      }
    },

    async publish(id) {
      return await this.update(id, { status: 'published' });
    },

    async unpublish(id) {
      return await this.update(id, { status: 'draft' });
    },

    async getPublished(options = {}) {
      return await this.getAll({
        ...options,
        filter: { status: { _eq: 'published' } }
      });
    },

    async getDrafts(options = {}) {
      return await this.getAll({
        ...options,
        filter: { status: { _eq: 'draft' } }
      });
    },

    async search(searchTerm, options = {}) {
      return await this.getAll({
        ...options,
        filter: {
          _or: [
            { title: { _icontains: searchTerm } },
            { content: { _icontains: searchTerm } }
          ]
        }
      });
    },

    async getStats() {
      try {
        // Get total count
        const totalResult = await directusClient.getItems('posts', { 
          limit: 1,
          meta: 'total_count' 
        });
        
        // Get published count
        const publishedResult = await directusClient.getItems('posts', { 
          limit: 1,
          filter: { status: { _eq: 'published' } },
          meta: 'total_count'
        });
        
        return {
          success: true,
          data: {
            total: totalResult.meta?.total_count || 0,
            published: publishedResult.meta?.total_count || 0,
            drafts: (totalResult.meta?.total_count || 0) - (publishedResult.meta?.total_count || 0)
          }
        };
      } catch (err) {
        return {
          success: false,
          error: { message: err.message }
        };
      }
    }
  },

  // Pages endpoints (similar structure)
  pages: {
    async getAll(options = {}) {
      try {
        const result = await directusClient.getItems('pages', {
          limit: options.limit || 50,
          offset: options.offset || 0,
          fields: options.fields || ['*'],
          sort: options.sort || ['-date_created'],
          filter: options.filter || {}
        });
        
        return {
          success: true,
          data: result.data || [],
          meta: result.meta || {}
        };
      } catch (err) {
        return {
          success: false,
          error: { message: err.message }
        };
      }
    },
    // ... other page methods similar to posts
  },

  // Collections management
  collections: {
    async discover() {
      try {
        // Try to access known collections
        const knownCollections = ['posts', 'pages', 'globals', 'navigation'];
        const availableCollections = [];
        
        for (const collection of knownCollections) {
          try {
            await directusClient.getItems(collection, { limit: 1 });
            availableCollections.push(collection);
          } catch (err) {
            console.log(`Collection ${collection} not accessible:`, err.message);
          }
        }
        
        return {
          success: true,
          collections: availableCollections
        };
      } catch (err) {
        return {
          success: false,
          error: { message: err.message }
        };
      }
    },

    async getStats(collection) {
      try {
        const result = await directusClient.getItems(collection, { 
          limit: 1,
          meta: 'total_count' 
        });
        
        return {
          success: true,
          data: {
            collection: collection,
            total: result.meta?.total_count || 0
          }
        };
      } catch (err) {
        return {
          success: false,
          error: { message: err.message }
        };
      }
    }
  },

  // Utilities
  utils: {
    async testConnection() {
      try {
        const result = await directusClient.testConnection();
        return result;
      } catch (err) {
        return {
          success: false,
          error: err.message
        };
      }
    }
  }
};

export default api;