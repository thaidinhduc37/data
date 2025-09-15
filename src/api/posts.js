// api/posts.js - Posts specific API
import collectionsService from './collections.js';

class PostsService {
  constructor() {
    this.collection = 'posts';
  }

  async getAllPosts(options = {}) {
    const defaultOptions = {
      limit: 50,
      sort: ['-date_created'],
      fields: ['*']
    };

    return await collectionsService.getItems(this.collection, { ...defaultOptions, ...options });
  }

  async getPost(id) {
    return await collectionsService.getItem(this.collection, id);
  }

  async getPublishedPosts(options = {}) {
    const filterOptions = {
      filter: {
        status: { _eq: 'published' }
      },
      ...options
    };

    return await collectionsService.getItems(this.collection, filterOptions);
  }

  async getDraftPosts(options = {}) {
    const filterOptions = {
      filter: {
        status: { _eq: 'draft' }
      },
      ...options
    };

    return await collectionsService.getItems(this.collection, filterOptions);
  }

  async createPost(postData) {
    const data = {
      status: 'draft',
      date_created: new Date().toISOString(),
      ...postData
    };

    return await collectionsService.createItem(this.collection, data);
  }

  async updatePost(id, postData) {
    const data = {
      date_updated: new Date().toISOString(),
      ...postData
    };

    return await collectionsService.updateItem(this.collection, id, data);
  }

  async deletePost(id) {
    return await collectionsService.deleteItem(this.collection, id);
  }

  async publishPost(id) {
    return await this.updatePost(id, { 
      status: 'published',
      date_published: new Date().toISOString()
    });
  }

  async unpublishPost(id) {
    return await this.updatePost(id, { status: 'draft' });
  }

  async searchPosts(searchTerm, options = {}) {
    const searchOptions = {
      searchFields: ['title', 'content', 'slug', 'excerpt'],
      ...options
    };

    return await collectionsService.searchItems(this.collection, searchTerm, searchOptions);
  }

  async getPostsByCategory(category, options = {}) {
    const filterOptions = {
      filter: {
        category: { _eq: category }
      },
      ...options
    };

    return await collectionsService.getItems(this.collection, filterOptions);
  }

  async getPostsByTag(tag, options = {}) {
    const filterOptions = {
      filter: {
        tags: { _contains: tag }
      },
      ...options
    };

    return await collectionsService.getItems(this.collection, filterOptions);
  }

  async getPostsStats() {
    return await collectionsService.getCollectionStats(this.collection);
  }
}

const postsService = new PostsService();
export default postsService;