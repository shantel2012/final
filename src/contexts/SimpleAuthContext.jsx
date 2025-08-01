// Simple AuthContext that won't block app loading
import React, { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // This will be called after successful login in LoginPage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      return { user: parsedUser, error: null };
    }
    return { user: null, error: 'Login failed' };
  };

  const signup = async (email, password, userData) => {
    // This is handled in SignupPage
    console.log('Signup attempt:', email);
    return { user: null, error: null };
  };

  const logout = async () => {
    setUser(null);
    setUserProfile(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  const getUserRole = () => {
    if (!user) return null;
    return user.role || 'user';
  };

  const isAuthenticated = !!user;

  const value = {
    user,
    userProfile,
    loading,
    login,
    signup,
    logout,
    getUserRole,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}