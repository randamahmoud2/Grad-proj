import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedAuth = localStorage.getItem('isAuthenticated');
        if (storedAuth) {
          const parsedAuth = JSON.parse(storedAuth);
          if (parsedAuth?.isAuthenticated) {
            setAuthState({
              user: parsedAuth,
              isAuthenticated: true,
              isLoading: false
            });
            
            // Redirect to dashboard if trying to access root or login while authenticated
            if (location.pathname === '/' || location.pathname === '/login') {
              navigate(`/${parsedAuth.role.toLowerCase()}/dashboard`, { replace: true });
            }
            return;
          }
        }
        setAuthState(prev => ({ ...prev, isLoading: false }));
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        localStorage.removeItem('isAuthenticated');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    };

    initializeAuth();
  }, [navigate, location.pathname]);

  const login = useCallback((userData) => {
    const normalizedUser = {
      ...userData,
      role: capitalizeRole(userData.role),
      isAuthenticated: true,
      loginTime: new Date().toISOString()
    };

    setAuthState({
      user: normalizedUser,
      isAuthenticated: true,
      isLoading: false
    });

    localStorage.setItem('isAuthenticated', JSON.stringify(normalizedUser));
    navigate(`/${normalizedUser.role.toLowerCase()}/dashboard`);
  }, [navigate]);

  const logout = useCallback(() => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  }, [navigate]);

  const isAuthenticated = useCallback(() => {
    return authState.isAuthenticated;
  }, [authState.isAuthenticated]);

  const getUserRole = useCallback(() => {
    return authState.user?.role;
  }, [authState.user]);

  const getCurrentUser = useCallback(() => {
    return authState.user;
  }, [authState.user]);

  const capitalizeRole = (role) => {
    if (!role) return '';
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  const value = {
    auth: authState.user,
    isAuthenticated,
    getUserRole,
    getCurrentUser,
    login,
    logout,
    isLoading: authState.isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
