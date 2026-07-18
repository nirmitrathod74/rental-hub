import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/index.js';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const data = await api.get('/accounts/profile/');
      setUser(data.data || data);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await api.post('/accounts/login/', {
        username,
        password,
      });
      localStorage.setItem('access_token', res.access);
      localStorage.setItem('refresh_token', res.refresh);
      setUser(res.user);
      return res.user;
    } catch (err) {
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const register = async (data) => {
    await api.post('/accounts/register/', data);
  };

  const updateProfile = async (data) => {
    const updated = await api.put('/accounts/profile/', data);
    setUser(updated.data || updated);
    return updated.data || updated;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, updateProfile }}>
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
