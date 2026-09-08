import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('taskflow_token'));
  const [loading, setLoading] = useState(true);

  // Initialize auth state on initial mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('taskflow_token');
      if (storedToken) {
        try {
          const response = await axiosClient.get('/auth/me');
          if (response.data && response.data.data && response.data.data.user) {
            setUser(response.data.data.user);
            setToken(storedToken);
          } else {
            throw new Error('User profile missing');
          }
        } catch (error) {
          console.warn('Session expired or invalid token:', error.message);
          localStorage.removeItem('taskflow_token');
          localStorage.removeItem('taskflow_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Log in user
   * @param {string} email
   * @param {string} password
   */
  const login = async (email, password) => {
    const response = await axiosClient.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = response.data.data;

    localStorage.setItem('taskflow_token', receivedToken);
    localStorage.setItem('taskflow_user', JSON.stringify(receivedUser));

    setToken(receivedToken);
    setUser(receivedUser);
    return response.data;
  };

  /**
   * Register new user
   * @param {string} name
   * @param {string} email
   * @param {string} password
   */
  const signup = async (name, email, password) => {
    const response = await axiosClient.post('/auth/signup', { name, email, password });
    return response.data;
  };

  /**
   * Log out user
   */
  const logout = () => {
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    login,
    signup,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
