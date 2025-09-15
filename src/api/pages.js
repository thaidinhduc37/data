// api/pages.js - Pages specific API
import collectionsService from './collections.js';

class PagesService {
  constructor() {
    this.collection = 'pages';
  }

  async getAllPages(options = {}) {
    const defaultOptions = {
      limit: 50,
      sort: ['sort', '-date_created'],
      fields: ['*']
    };

    return await collectionsService.getItems(this.collection, { ...defaultOptions, ...options });
  }

  async getPage(id) {
    return await collectionsService.getItem(this.collection, id);
  }

  async getPageBySlug(slug) {
    const result = await collectionsService.getItems(this.collection, {
      filter: {
        slug: { _eq: slug }
      },
      limit: 1
    });

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
      error: { message: 'Page not found' }
    };
  }

  async getPublishedPages(options = {}) {
    const filterOptions = {
      filter: {
        status: { _eq: 'published' }
      },
      ...options
    };

    return await collectionsService.getItems(this.collection, filterOptions);
  }

  async createPage(pageData) {
    const data = {
      status: 'draft',
      date_created: new Date().toISOString(),
      ...pageData
    };

    return await collectionsService.createItem(this.collection, data);
  }

  async updatePage(id, pageData) {
    const data = {
      date_updated: new Date().toISOString(),
      ...pageData
    };

    return await collectionsService.updateItem(this.collection, id, data);
  }

  async deletePage(id) {
    return await collectionsService.deleteItem(this.collection, id);
  }

  async publishPage(id) {
    return await this.updatePage(id, { 
      status: 'published',
      date_published: new Date().toISOString()
    });
  }

  async searchPages(searchTerm, options = {}) {
    const searchOptions = {
      searchFields: ['title', 'content', 'slug', 'meta_description'],
      ...options
    };

    return await collectionsService.searchItems(this.collection, searchTerm, searchOptions);
  }

  async getNavigationPages(options = {}) {
    const filterOptions = {
      filter: {
        show_in_navigation: { _eq: true }
      },
      sort: ['sort'],
      ...options
    };

    return await collectionsService.getItems(this.collection, filterOptions);
  }

  async updatePageOrder(pageUpdates) {
    return await collectionsService.bulkUpdate(this.collection, pageUpdates);
  }

  async getPagesStats() {
    return await collectionsService.getCollectionStats(this.collection);
  }
}

const pagesService = new PagesService();
export default pagesService;