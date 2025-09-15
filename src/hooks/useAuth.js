// hooks/useAuth.js - Authentication hook
import { useState, useEffect, useCallback } from 'react';
import api from '../api/index.js';
import config from '../config/index.js';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is already logged in on mount (only check existing session)
  useEffect(() => {
    const checkExistingSession = async () => {
      if (api.auth.isLoggedIn()) {
        try {
          const result = await api.auth.getCurrentUser();
          if (result.success) {
            setUser(result.data);
            setIsLoggedIn(true);
          }
        } catch (err) {
          console.log('No existing session found');
        }
      }
    };
    
    checkExistingSession();
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await api.auth.login(email, password);
      
      if (result.success) {
        setUser(result.data.user);
        setIsLoggedIn(true);
        return { success: true };
      } else {
        setError(result.error.message);
        return { success: false, error: result.error.message };
      }
    } catch (err) {
      const errorMessage = err.message || 'Đăng nhập thất bại';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await api.auth.logout();
      
      setUser(null);
      setIsLoggedIn(false);
      setError(null);
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh user info
  const refreshUser = useCallback(async () => {
    try {
      if (!api.auth.isLoggedIn()) {
        return { success: false, error: 'Not logged in' };
      }

      const result = await api.auth.getCurrentUser();
      
      if (result.success) {
        setUser(result.data);
        return { success: true, data: result.data };
      } else {
        setError(result.error.message);
        return result;
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Check permissions for collection
  const hasPermission = useCallback((collection, action = 'read') => {
    if (!user || !user.role) return false;
    
    // Admin users have all permissions
    if (user.role.admin_access) return true;
    
    // Check specific permissions
    const permissions = user.role.permissions || [];
    return permissions.some(p => 
      p.collection === collection && 
      (p.action === action || p.action === '*')
    );
  }, [user]);

  // Get user role info
  const getUserRole = useCallback(() => {
    if (!user) return null;
    
    // Check if user has admin role in Directus
    if (user.role?.admin_access) {
      return {
        type: 'admin',
        name: 'Administrator',
        description: 'Full administrative access',
        level: 90,
        permissions: user.role.permissions || ['*']
      };
    }
    
    // Determine role based on permissions
    const permissions = user.role?.permissions || [];
    const hasWriteAccess = permissions.some(p => 
      ['create', 'update', 'delete', '*'].includes(p.action)
    );
    
    if (hasWriteAccess) {
      return {
        type: 'editor',
        name: 'Editor',
        description: 'Can create and edit content',
        level: 50,
        permissions: permissions
      };
    }
    
    return {
      type: 'user',
      name: 'User',
      description: 'Read-only access',
      level: 10,
      permissions: permissions
    };
  }, [user]);

  // Check if user can access admin features
  const canAccessAdmin = useCallback(() => {
    const role = getUserRole();
    return role && role.level >= 50;
  }, [getUserRole]);

  // Check if user can manage specific collections
  const canManageCollection = useCallback((collection) => {
    if (!user) return false;
    
    const role = getUserRole();
    if (role && role.level >= 90) return true;
    
    return hasPermission(collection, 'create') || 
           hasPermission(collection, 'update') || 
           hasPermission(collection, 'delete');
  }, [user, getUserRole, hasPermission]);

  // Get accessible collections for current user
  const getAccessibleCollections = useCallback(() => {
    if (!user) return [];
    
    const role = getUserRole();
    if (role && role.level >= 90) {
      return ['posts', 'pages', 'forms', 'form_submissions', 'navigation', 'globals'];
    }
    
    const permissions = user.role?.permissions || [];
    const accessibleCollections = new Set();
    
    permissions.forEach(permission => {
      if (permission.collection && permission.action !== 'none') {
        accessibleCollections.add(permission.collection);
      }
    });
    
    return Array.from(accessibleCollections);
  }, [user, getUserRole]);

  return {
    // State
    user,
    isLoggedIn,
    isLoading,
    error,
    
    // Actions
    login,
    logout,
    refreshUser,
    
    // Permission utilities
    hasPermission,
    getUserRole,
    canAccessAdmin,
    canManageCollection,
    getAccessibleCollections,
    
    // Utilities
    clearError: () => setError(null)
  };
};