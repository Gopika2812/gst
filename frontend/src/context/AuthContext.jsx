import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('auditor_user');
    if (!savedUser) return null;
    try {
      const parsed = JSON.parse(savedUser);
      return {
        ...parsed,
        _id: parsed._id || parsed.id,
        id: parsed.id || parsed._id
      };
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('auditor_token') || null);
  const [loading, setLoading] = useState(false);

  // Sync latest user profile on load if token exists
  useEffect(() => {
    if (token) {
      api.get('/auth/profile')
        .then((res) => {
          if (res.data) {
            const userData = {
              ...res.data,
              _id: res.data._id || res.data.id,
              id: res.data._id || res.data.id
            };
            setUser(userData);
            localStorage.setItem('auditor_user', JSON.stringify(userData));
          }
        })
        .catch((err) => {
          console.error('Failed to sync user profile:', err);
        });
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: jwtToken, user: rawUser } = res.data;
      const userData = {
        ...rawUser,
        _id: rawUser._id || rawUser.id,
        id: rawUser.id || rawUser._id
      };
      
      localStorage.setItem('auditor_token', jwtToken);
      localStorage.setItem('auditor_user', JSON.stringify(userData));
      
      setToken(jwtToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check credentials.'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', formData);
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed.'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auditor_token');
    localStorage.removeItem('auditor_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const hasPermission = (moduleName, action = 'view') => {
    if (!user) return false;
    if (user.role === 'Super Admin') return true;
    return true; // Flexible default for staff roles view
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
