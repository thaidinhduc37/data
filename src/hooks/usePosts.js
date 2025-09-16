// hooks/usePosts.js - Posts management hook (Fixed infinite loop)
import { useState, useEffect, useCallback, useRef } from 'react';

export const usePosts = (options = {}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const { autoFetch = false, filters = {} } = options;
  
  // Sử dụng useRef để tránh thay đổi reference của filters
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // Create direct API client - memoize để tránh tạo lại
  const createPostsAPI = useCallback(() => {
    return {
      async getPosts(options = {}) {
        const token = localStorage.getItem('directus_access_token');
        if (!token) {
          throw new Error('No authentication token found. Please login first.');
        }
        
        const params = new URLSearchParams();
        
        // Default options
        params.append('limit', options.limit || '50');
        if (options.sort) {
          params.append('sort', Array.isArray(options.sort) ? options.sort.join(',') : options.sort);
        } else {
          params.append('sort', '-date_created');
        }
        
        const url = `/items/posts?${params.toString()}`;
        console.log('Fetching posts from:', url);
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Received data:', data);
        return data;
      },

      async getPost(id) {
        const token = localStorage.getItem('directus_access_token');
        
        const response = await fetch(`/items/posts/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch post: ${response.statusText}`);
        }

        return response.json();
      },

      async createPost(postData) {
        const token = localStorage.getItem('directus_access_token');
        
        const data = {
          status: 'draft',
          date_created: new Date().toISOString(),
          ...postData
        };

        const response = await fetch('/items/posts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`Failed to create post: ${response.statusText}`);
        }

        return response.json();
      },

      async updatePost(id, postData) {
        const token = localStorage.getItem('directus_access_token');
        
        const data = {
          date_updated: new Date().toISOString(),
          ...postData
        };

        const response = await fetch(`/items/posts/${id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`Failed to update post: ${response.statusText}`);
        }

        return response.json();
      },

      async deletePost(id) {
        const token = localStorage.getItem('directus_access_token');
        
        const response = await fetch(`/items/posts/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to delete post: ${response.statusText}`);
        }

        return { success: true };
      },

      async searchPosts(searchTerm, options = {}) {
        const token = localStorage.getItem('directus_access_token');
        const searchParams = new URLSearchParams();
        searchParams.append('limit', options.limit || '20');
        searchParams.append('sort', '-date_created');
        
        // Simple search implementation
        searchParams.append('filter[title][_contains]', searchTerm);
        
        const url = `/items/posts?${searchParams.toString()}`;
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to search posts: ${response.statusText}`);
        }

        return response.json();
      }
    };
  }, []);

  const api = createPostsAPI();

  // Fetch posts - loại bỏ filters khỏi dependencies
  const fetchPosts = useCallback(async (fetchOptions = {}) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching posts from Directus...');
      const response = await api.getPosts({ ...filtersRef.current, ...fetchOptions });
      
      if (response.data) {
        setPosts(response.data);
        console.log(`Loaded ${response.data.length} posts`);
        return response.data;
      } else {
        setError('No posts data received');
        return [];
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err.message || 'Failed to load posts');
      return [];
    } finally {
      setLoading(false);
    }
  }, [api]); // Chỉ depend vào api

  // Fetch single post
  const fetchPost = useCallback(async (id) => {
    try {
      const response = await api.getPost(id);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error fetching post:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [api]);

  // Create post
  const createPost = useCallback(async (postData) => {
    try {
      setLoading(true);
      const response = await api.createPost(postData);
      
      if (response.data) {
        setPosts(prev => [response.data, ...prev]);
        return { success: true, data: response.data };
      } else {
        setError('Failed to create post');
        return { success: false, error: 'Failed to create post' };
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Update post
  const updatePost = useCallback(async (id, postData) => {
    try {
      setLoading(true);
      const response = await api.updatePost(id, postData);
      
      if (response.data) {
        setPosts(prev => prev.map(post => 
          post.id === id ? { ...post, ...response.data } : post
        ));
        return { success: true, data: response.data };
      } else {
        setError('Failed to update post');
        return { success: false, error: 'Failed to update post' };
      }
    } catch (err) {
      console.error('Error updating post:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Delete post
  const deletePost = useCallback(async (id) => {
    try {
      setLoading(true);
      await api.deletePost(id);
      
      setPosts(prev => prev.filter(post => post.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting post:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Publish post
  const publishPost = useCallback(async (id) => {
    try {
      const response = await api.updatePost(id, { 
        status: 'published',
        date_published: new Date().toISOString()
      });
      
      if (response.data) {
        setPosts(prev => prev.map(post => 
          post.id === id ? { ...post, status: 'published' } : post
        ));
        return { success: true, data: response.data };
      }
    } catch (err) {
      console.error('Error publishing post:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [api]);

  // Unpublish post
  const unpublishPost = useCallback(async (id) => {
    try {
      const response = await api.updatePost(id, { status: 'draft' });
      
      if (response.data) {
        setPosts(prev => prev.map(post => 
          post.id === id ? { ...post, status: 'draft' } : post
        ));
        return { success: true, data: response.data };
      }
    } catch (err) {
      console.error('Error unpublishing post:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [api]);

  // Search posts
  const searchPosts = useCallback(async (searchTerm, searchOptions = {}) => {
    try {
      setLoading(true);
      console.log(`Searching posts for: "${searchTerm}"`);
      
      const response = await api.searchPosts(searchTerm, searchOptions);
      
      if (response.data) {
        setPosts(response.data);
        console.log(`Found ${response.data.length} posts matching "${searchTerm}"`);
        return response.data;
      } else {
        setPosts([]);
        return [];
      }
    } catch (err) {
      console.error('Error searching posts:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Get posts by status
  const getPublishedPosts = useCallback(async (fetchOptions = {}) => {
    return fetchPosts({
      ...fetchOptions,
      filter: { status: { _eq: 'published' } }
    });
  }, [fetchPosts]);

  const getDraftPosts = useCallback(async (fetchOptions = {}) => {
    return fetchPosts({
      ...fetchOptions,
      filter: { status: { _eq: 'draft' } }
    });
  }, [fetchPosts]);

  // Get stats - loại bỏ khỏi dependencies để tránh infinite loop
  const fetchStats = useCallback(() => {
    try {
      const totalPosts = posts.length;
      const publishedPosts = posts.filter(p => p.status === 'published').length;
      const draftPosts = posts.filter(p => p.status === 'draft').length;
      
      const statsData = {
        total: totalPosts,
        published: publishedPosts,
        draft: draftPosts,
        recent: posts.slice(0, 5)
      };
      
      setStats(statsData);
      return statsData;
    } catch (err) {
      console.error('Error calculating stats:', err);
      setError(err.message);
    }
    return null;
  }, [posts]);

  // Auto-fetch on mount - chỉ chạy 1 lần duy nhất
  useEffect(() => {
    if (autoFetch) {
      fetchPosts();
    }
  }, [autoFetch]); // Chỉ depend vào autoFetch, không depend fetchPosts

  // Update stats when posts change - sử dụng separate useEffect
  useEffect(() => {
    if (posts.length >= 0) { // Cho phép cả trường hợp 0 posts
      fetchStats();
    }
  }, [posts.length]); // Chỉ depend vào posts.length thay vì toàn bộ posts array

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