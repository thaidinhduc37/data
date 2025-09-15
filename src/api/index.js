// api/index.js - Central API exports
import directusClient from './directus.js';
import authService from './auth.js';
import collectionsService from './collections.js';
import postsService from './posts.js';
import pagesService from './pages.js';

// Export all services individually
export { default as directusClient } from './directus.js';
export { default as authService } from './auth.js';
export { default as collectionsService } from './collections.js';
export { default as postsService } from './posts.js';
export { default as pagesService } from './pages.js';

// Main API object - clean and simple
const api = {
  // Authentication
  auth: {
    login: authService.login.bind(authService),
    logout: authService.logout.bind(authService),
    getCurrentUser: authService.getCurrentUser.bind(authService),
    refreshToken: authService.refreshToken.bind(authService),
    isLoggedIn: authService.isLoggedIn.bind(authService),
    getUser: authService.getUser.bind(authService)
  },

  // Posts
  posts: {
    getAll: postsService.getAllPosts.bind(postsService),
    get: postsService.getPost.bind(postsService),
    create: postsService.createPost.bind(postsService),
    update: postsService.updatePost.bind(postsService),
    delete: postsService.deletePost.bind(postsService),
    publish: postsService.publishPost.bind(postsService),
    unpublish: postsService.unpublishPost.bind(postsService),
    search: postsService.searchPosts.bind(postsService),
    getPublished: postsService.getPublishedPosts.bind(postsService),
    getDrafts: postsService.getDraftPosts.bind(postsService),
    getByCategory: postsService.getPostsByCategory.bind(postsService),
    getByTag: postsService.getPostsByTag.bind(postsService),
    getStats: postsService.getPostsStats.bind(postsService)
  },

  // Pages
  pages: {
    getAll: pagesService.getAllPages.bind(pagesService),
    get: pagesService.getPage.bind(pagesService),
    getBySlug: pagesService.getPageBySlug.bind(pagesService),
    create: pagesService.createPage.bind(pagesService),
    update: pagesService.updatePage.bind(pagesService),
    delete: pagesService.deletePage.bind(pagesService),
    publish: pagesService.publishPage.bind(pagesService),
    search: pagesService.searchPages.bind(pagesService),
    getPublished: pagesService.getPublishedPages.bind(pagesService),
    getNavigation: pagesService.getNavigationPages.bind(pagesService),
    updateOrder: pagesService.updatePageOrder.bind(pagesService),
    getStats: pagesService.getPagesStats.bind(pagesService)
  },

  // Generic collections
  collections: {
    discover: collectionsService.discoverCollections.bind(collectionsService),
    getItems: collectionsService.getItems.bind(collectionsService),
    getItem: collectionsService.getItem.bind(collectionsService),
    create: collectionsService.createItem.bind(collectionsService),
    update: collectionsService.updateItem.bind(collectionsService),
    delete: collectionsService.deleteItem.bind(collectionsService),
    search: collectionsService.searchItems.bind(collectionsService),
    getStats: collectionsService.getCollectionStats.bind(collectionsService),
    bulkDelete: collectionsService.bulkDelete.bind(collectionsService),
    bulkUpdate: collectionsService.bulkUpdate.bind(collectionsService)
  },

  // Utilities
  utils: {
    getFileURL: directusClient.getFileURL.bind(directusClient),
    formatDate: directusClient.formatDate.bind(directusClient),
    testConnection: directusClient.testConnection.bind(directusClient),
    debug: directusClient.debug.bind(directusClient)
  }
};

// Export the main API object as default
export default api;

// Export as named export too for flexibility
export { api };