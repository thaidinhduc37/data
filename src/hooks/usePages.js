// hooks/usePages.js - Pages management hook
import { useState, useEffect, useCallback } from 'react';
import api from '../api/index.js';

export const usePages = (options = {}) => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const { autoFetch = true, filters = {} } = options;

  // Fetch pages
  const fetchPages = useCallback(async (fetchOptions = {}) => {
    try {
      setLoading(true);
      setError(null);

      const result = await api.pages.getAll({ ...filters, ...fetchOptions });
      
      if (result.success) {
        setPages(result.data);
        return result.data;
      } else {
        setError(result.error.message);
        return [];
      }
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch single page
  const fetchPage = useCallback(async (id) => {
    try {
      const result = await api.pages.get(id);
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Fetch page by slug
  const fetchPageBySlug = useCallback(async (slug) => {
    try {
      const result = await api.pages.getBySlug(slug);
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Create page
  const createPage = useCallback(async (pageData) => {
    try {
      setLoading(true);
      const result = await api.pages.create(pageData);
      
      if (result.success) {
        setPages(prev => [result.data, ...prev]);
        return result;
      } else {
        setError(result.error.message);
        return result;
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update page
  const updatePage = useCallback(async (id, pageData) => {
    try {
      setLoading(true);
      const result = await api.pages.update(id, pageData);
      
      if (result.success) {
        setPages(prev => prev.map(page => 
          page.id === id ? { ...page, ...result.data } : page
        ));
        return result;
      } else {
        setError(result.error.message);
        return result;
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete page
  const deletePage = useCallback(async (id) => {
    try {
      setLoading(true);
      const result = await api.pages.delete(id);
      
      if (result.success) {
        setPages(prev => prev.filter(page => page.id !== id));
        return result;
      } else {
        setError(result.error.message);
        return result;
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Publish page
  const publishPage = useCallback(async (id) => {
    try {
      const result = await api.pages.publish(id);
      
      if (result.success) {
        setPages(prev => prev.map(page => 
          page.id === id ? { ...page, status: 'published' } : page
        ));
        return result;
      } else {
        setError(result.error.message);
        return result;
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Search pages
  const searchPages = useCallback(async (searchTerm, searchOptions = {}) => {
    try {
      setLoading(true);
      const result = await api.pages.search(searchTerm, searchOptions);
      
      if (result.success) {
        setPages(result.data);
        return result.data;
      } else {
        setError(result.error.message);
        return [];
      }
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get published pages
  const getPublishedPages = useCallback(async (fetchOptions = {}) => {
    try {
      setLoading(true);
      const result = await api.pages.getPublished(fetchOptions);
      
      if (result.success) {
        setPages(result.data);
        return result.data;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
    return [];
  }, []);

  // Get navigation pages
  const getNavigationPages = useCallback(async (fetchOptions = {}) => {
    try {
      const result = await api.pages.getNavigation(fetchOptions);
      
      if (result.success) {
        return result.data;
      }
    } catch (err) {
      setError(err.message);
    }
    return [];
  }, []);

  // Update pages order
  const updatePagesOrder = useCallback(async (pageUpdates) => {
    try {
      setLoading(true);
      const result = await api.pages.updateOrder(pageUpdates);
      
      if (result.success) {
        // Refresh pages to get updated order
        await fetchPages();
        return result;
      } else {
        setError(result.error.message);
        return result;
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchPages]);

  // Get stats
  const fetchStats = useCallback(async () => {
    try {
      const result = await api.pages.getStats();
      if (result.success) {
        setStats(result.data);
        return result.data;
      }
    } catch (err) {
      setError(err.message);
    }
    return null;
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchPages();
      fetchStats();
    }
  }, [autoFetch, fetchPages, fetchStats]);

  return {
    // State
    pages,
    loading,
    error,
    stats,
    
    // Actions
    fetchPages,
    fetchPage,
    fetchPageBySlug,
    createPage,
    updatePage,
    deletePage,
    publishPage,
    searchPages,
    getPublishedPages,
    getNavigationPages,
    updatePagesOrder,
    fetchStats,
    
    // Utilities
    clearError: () => setError(null),
    refresh: () => fetchPages()
  };
};