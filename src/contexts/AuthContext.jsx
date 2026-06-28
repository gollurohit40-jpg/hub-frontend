import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Set base URL for all axios requests
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
      setToken(null);
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, expectedRole = null) => {
    try {
      console.log('🔐 Attempting login for:', email, 'Expected Role:', expectedRole);
      
      const response = await axios.post('/api/auth/login', { 
        email: email.trim(), 
        password: password.trim(),
        expectedRole: expectedRole
      });
      
      console.log('✅ Login successful!');
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setToken(token);
      setUser(user);
      
      toast.success(`Welcome back, ${user.name}!`);
      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error.response?.data || error.message);
      console.error('❌ Full error:', error);
      
      // Check for role mismatch
      if (error.response?.data?.roleMismatch) {
        return {
          success: false,
          error: error.response?.data?.message || 'Role mismatch. Please use the correct login panel.',
          roleMismatch: true,
          expectedRole: error.response?.data?.expectedRole,
          actualRole: error.response?.data?.actualRole
        };
      }
      
      // Check for network errors
      if (error.code === 'ERR_NETWORK' || error.message.includes('ECONNREFUSED')) {
        toast.error('Cannot connect to server. Make sure backend is running on port 5000.');
        return { success: false, error: 'Server not running' };
      }
      
      // Check for approval status
      if (error.response?.data?.requiresApproval) {
        return { 
          success: false, 
          error: error.response?.data?.message || 'Account pending admin approval.',
          requiresApproval: true,
          approvalStatus: error.response?.data?.approvalStatus || 'pending'
        };
      }
      
      // Check for verification
      if (error.response?.data?.requiresVerification) {
        return { 
          success: false, 
          error: 'Please verify your email before logging in.',
          requiresVerification: true 
        };
      }
      
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    hasRole: (roles) => {
      if (!user) return false;
      if (typeof roles === 'string') return user.role === roles;
      return roles.includes(user.role);
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;