// hooks/index.js - Export all hooks
import { useDirectus } from './useDirectus.js';
import { useAuth } from './useAuth.js';
import { usePosts } from './usePosts.js';
import { usePages } from './usePages.js';

// Named exports
export { useDirectus } from './useDirectus.js';
export { useAuth } from './useAuth.js';
export { usePosts } from './usePosts.js';
export { usePages } from './usePages.js';

// Default export object
export default {
  useDirectus,
  useAuth,
  usePosts,
  usePages
};