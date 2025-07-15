import React, { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.js';
import { useAppData } from '@/hooks/useAppData.jsx';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const auth = useAuth();
  const appData = useAppData(auth.currentUser, auth.loadingAuth, () => navigate('/auth?action=login'));

  const value = {
    ...auth,
    ...appData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};