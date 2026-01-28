import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthChange((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    return await AuthService.login(email, password);
  };

  const register = async (email, password, username) => {
    return await AuthService.register(email, password, username);
  };

  const logout = async () => {
    return await AuthService.logout();
  };

  const resetPassword = async (email) => {
    return await AuthService.resetPassword(email);
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
