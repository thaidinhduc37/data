// hooks/useDirectus.js - Main Directus connection hook
import { useState, useEffect, useCallback } from 'react';
import api from '../api/index.js';

export const useDirectus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collections, setCollections] = useState([]);
  const [serverInfo, setServerInfo] = useState(null);

  // Test connection and discover collections
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Test connection first
      const connectionResult = await api.utils.testConnection();
      
      if (connectionResult.success) {
        setIsConnected(true);
        setServerInfo(connectionResult.serverInfo);
        
        // Discover available collections
        const collectionsResult = await api.collections.discover();
        if (collectionsResult.success) {
          setCollections(collectionsResult.collections);
        }
      } else {
        throw new Error(connectionResult.error);
      }
    } catch (err) {
      setError(err.message);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Refresh collections
  const refreshCollections = useCallback(async () => {
    try {
      const result = await api.collections.discover();
      if (result.success) {
        setCollections(result.collections);
        return result.collections;
      }
    } catch (err) {
      setError(err.message);
    }
    return [];
  }, []);

  // Get collection stats
  const getCollectionStats = useCallback(async (collection) => {
    try {
      const result = await api.collections.getStats(collection);
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  return {
    // State
    isConnected,
    isLoading,
    error,
    collections,
    serverInfo,
    
    // Actions
    initialize,
    refreshCollections,
    getCollectionStats,
    
    // Utilities
    clearError: () => setError(null)
  };
};