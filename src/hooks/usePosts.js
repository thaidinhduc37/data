// hooks/usePosts.js - Posts management hook
import { useState, useEffect, useCallback } from 'react';
import api from '../api/index.js';

export const usePosts = (options = {}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // Auto-fetch on mount if enabled
  const { autoFetch = true, filters = {} } = options;

  // Fetch posts
  const fetchPosts = useCallback(async (fetchOptions = {}) => {
    try {
      setLoading(true);
      setError(null);

      const result = await api.posts.getAll({ ...filters, ...fetchOptions });
      
      if (result.success) {
        setPosts(result.data);
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

  // Fetch single post
  const fetchPost = useCallback(async (id) => {
    try {
      const result = await api.posts.get(id);
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Create post
  const createPost = useCallback(async (postData) => {
    try {
      setLoading(true);
      const result = await api.posts.create(postData);
      
      if (result.success) {
        // Add to local state
        setPosts(prev => [result.data, ...prev]);
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

  // Update post
  const updatePost = useCallback(async (id, postData) => {
    try {
      setLoading(true);
      const result = await api.posts.update(id, postData);
      
      if (result.success) {
        // Update local state
        setPosts(prev => prev.map(post => 
          post.id === id ? { ...post, ...result.data } : post
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

  // Delete post
  const deletePost = useCallback(async (id) => {
    try {
      setLoading(true);
      const result = await api.posts.delete(id);
      
      if (result.success) {
        // Remove from local state
        setPosts(prev => prev.filter(post => post.id !== id));
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

  // Publish post
  const publishPost = useCallback(async (id) => {
    try {
      const result = await api.posts.publish(id);
      
      if (result.success) {
        // Update local state
        setPosts(prev => prev.map(post => 
          post.id === id ? { ...post, status: 'published' } : post
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

  // Unpublish post
  const unpublishPost = useCallback(async (id) => {
    try {
      const result = await api.posts.unpublish(id);
      
      if (result.success) {
        // Update local state
        setPosts(prev => prev.map(post => 
          post.id === id ? { ...post, status: 'draft' } : post
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

  // Search posts
  const searchPosts = useCallback(async (searchTerm, searchOptions = {}) => {
    try {
      setLoading(true);
      const result = await api.posts.search(searchTerm, searchOptions);
      
      if (result.success) {
        setPosts(result.data);
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

  // Get posts by status
  const getPublishedPosts = useCallback(async (fetchOptions = {}) => {
    try {
      setLoading(true);
      const result = await api.posts.getPublished(fetchOptions);
      
      if (result.success) {
        setPosts(result.data);
        return result.data;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
    return [];
  }, []);

  const getDraftPosts = useCallback(async (fetchOptions = {}) => {
    try {
      setLoading(true);
      const result = await api.posts.getDrafts(fetchOptions);
      
      if (result.success) {
        setPosts(result.data);
        return result.data;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
    return [];
  }, []);

  // Get stats
  const fetchStats = useCallback(async () => {
    try {
      const result = await api.posts.getStats();
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
      fetchPosts();
      fetchStats();
    }
  }, [autoFetch, fetchPosts, fetchStats]);

  return {
    // State
    posts,
    loading,
    error,
    stats,
    
    // Actions
    fetchPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost,
    publishPost,
    unpublishPost,
    searchPosts,
    getPublishedPosts,
    getDraftPosts,
    fetchStats,
    
    // Utilities
    clearError: () => setError(null),
    refresh: () => fetchPosts()
  };
};