// api/collections.js - Collections CRUD Operations
import { readItems, createItem, updateItem, deleteItem } from '@directus/sdk';
import directusClient from './directus.js';

class CollectionsService {
  // Auto-discover available collections
  async discoverCollections() {
    const collectionsToTest = [
      'posts', 'pages', 'articles', 'blogs', 'news',
      'forms', 'form_submissions', 'contacts',
      'navigation', 'menus', 'categories', 'tags',
      'globals', 'settings', 'config',
      'redirects', 'seo', 'ai_prompts', 'prompts',
      'directus_files', 'media', 'gallery'
    ];

    const workingCollections = [];
    
    for (const collectionName of collectionsToTest) {
      try {
        const result = await directusClient.request(readItems(collectionName, { limit: 1 }));
        if (result.success) {
          workingCollections.push(collectionName);
          console.log(`✅ ${collectionName}: Available`);
        }
      } catch (err) {
        console.log(`❌ ${collectionName}: ${err.message}`);
      }
    }

    // Try to get system collections if authenticated
    const systemCollections = await directusClient.getAvailableCollections();
    if (systemCollections.success) {
      const systemNames = systemCollections.collections.map(c => c.name);
      systemNames.forEach(name => {
        if (!workingCollections.includes(name)) {
          workingCollections.push(name);
        }
      });
    }

    return {
      success: true,
      collections: workingCollections,
      error: null
    };
  }

  // Get items from any collection with options
  async getItems(collection, options = {}) {
    const defaultOptions = {
      limit: 50,
      fields: ['*'],
      sort: ['-date_created', '-date_updated', '-id']
    };

    const queryOptions = { ...defaultOptions, ...options };
    
    const result = await directusClient.request(readItems(collection, queryOptions));
    
    if (result.success) {
      return {
        success: true,
        data: result.data,
        collection: collection,
        count: result.data.length,
        error: null
      };
    }

    return result;
  }

  // Get single item by ID
  async getItem(collection, id, options = {}) {
    const defaultOptions = {
      fields: ['*']
    };

    const queryOptions = { ...defaultOptions, ...options };
    
    const result = await directusClient.request(readItems(collection, {
      filter: { id: { _eq: id } },
      ...queryOptions
    }));
    
    if (result.success && result.data.length > 0) {
      return {
        success: true,
        data: result.data[0],
        error: null
      };
    }

    return {
      success: false,
      data: null,
      error: {
        message: 'Item not found',
        code: 404
      }
    };
  }

  // Create new item
  async createItem(collection, data) {
    const result = await directusClient.request(createItem(collection, data));
    
    if (result.success) {
      console.log(`✅ Created item in ${collection}:`, result.data.id);
      return {
        success: true,
        data: result.data,
        message: `Tạo ${collection} thành công!`,
        error: null
      };
    }

    return {
      ...result,
      message: `Không thể tạo ${collection}`
    };
  }

  // Update existing item
  async updateItem(collection, id, data) {
    const result = await directusClient.request(updateItem(collection, id, data));
    
    if (result.success) {
      console.log(`✅ Updated item in ${collection}:`, id);
      return {
        success: true,
        data: result.data,
        message: `Cập nhật ${collection} thành công!`,
        error: null
      };
    }

    return {
      ...result,
      message: `Không thể cập nhật ${collection}`
    };
  }

  // Delete item
  async deleteItem(collection, id) {
    const result = await directusClient.request(deleteItem(collection, id));
    
    if (result.success) {
      console.log(`✅ Deleted item from ${collection}:`, id);
      return {
        success: true,
        data: { id },
        message: `Xóa ${collection} thành công!`,
        error: null
      };
    }

    return {
      ...result,
      message: `Không thể xóa ${collection}`
    };
  }

  // Search items with filters
  async searchItems(collection, searchTerm, options = {}) {
    const searchFields = options.searchFields || ['title', 'name', 'content', 'description'];
    
    const filters = {
      _or: searchFields.map(field => ({
        [field]: {
          _contains: searchTerm
        }
      }))
    };

    const queryOptions = {
      filter: filters,
      limit: options.limit || 20,
      fields: options.fields || ['*'],
      sort: options.sort || ['-date_created']
    };

    const result = await directusClient.request(readItems(collection, queryOptions));
    
    if (result.success) {
      return {
        success: true,
        data: result.data,
        searchTerm: searchTerm,
        count: result.data.length,
        error: null
      };
    }

    return result;
  }

  // Get collection statistics
  async getCollectionStats(collection) {
    try {
      // Get total count
      const totalResult = await directusClient.request(readItems(collection, {
        limit: 0,
        meta: ['total_count']
      }));

      // Get recent items
      const recentResult = await directusClient.request(readItems(collection, {
        limit: 5,
        sort: ['-date_created'],
        fields: ['id', 'date_created', 'title', 'name', 'status']
      }));

      if (totalResult.success && recentResult.success) {
        return {
          success: true,
          data: {
            total: totalResult.data?.meta?.total_count || 0,
            recent: recentResult.data || [],
            collection: collection
          },
          error: null
        };
      }

      return {
        success: false,
        data: {
          total: 0,
          recent: [],
          collection: collection
        },
        error: null
      };
    } catch (error) {
      return {
        success: false,
        data: {
          total: 0,
          recent: [],
          collection: collection
        },
        error: {
          message: error.message
        }
      };
    }
  }

  // Bulk operations
  async bulkDelete(collection, ids) {
    const results = [];
    
    for (const id of ids) {
      const result = await this.deleteItem(collection, id);
      results.push({ id, ...result });
    }

    const successCount = results.filter(r => r.success).length;
    
    return {
      success: successCount > 0,
      data: results,
      message: `Đã xóa ${successCount}/${ids.length} items`,
      error: successCount === 0 ? { message: 'Không thể xóa item nào' } : null
    };
  }

  async bulkUpdate(collection, updates) {
    const results = [];
    
    for (const { id, data } of updates) {
      const result = await this.updateItem(collection, id, data);
      results.push({ id, ...result });
    }

    const successCount = results.filter(r => r.success).length;
    
    return {
      success: successCount > 0,
      data: results,
      message: `Đã cập nhật ${successCount}/${updates.length} items`,
      error: successCount === 0 ? { message: 'Không thể cập nhật item nào' } : null
    };
  }
}

const collectionsService = new CollectionsService();
export default collectionsService;