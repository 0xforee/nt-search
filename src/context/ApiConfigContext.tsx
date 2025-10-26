import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ApiConfigContextType {
  apiBaseUrl: string;
  setApiBaseUrl: (url: string) => void;
  resetToDefault: () => void;
}

const ApiConfigContext = createContext<ApiConfigContextType | undefined>(undefined);

const DEFAULT_API_BASE_URL = 'http://localhost:3000/api/v1';
const API_BASE_URL_KEY = 'api_base_url';

interface ApiConfigProviderProps {
  children: ReactNode;
}

export const ApiConfigProvider: React.FC<ApiConfigProviderProps> = ({ children }) => {
  const [apiBaseUrl, setApiBaseUrlState] = useState<string>(DEFAULT_API_BASE_URL);

  // Load API base URL from localStorage on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem(API_BASE_URL_KEY);
    if (savedUrl) {
      setApiBaseUrlState(savedUrl);
    }
  }, []);

  const setApiBaseUrl = (url: string) => {
    setApiBaseUrlState(url);
    localStorage.setItem(API_BASE_URL_KEY, url);
  };

  const resetToDefault = () => {
    setApiBaseUrlState(DEFAULT_API_BASE_URL);
    localStorage.removeItem(API_BASE_URL_KEY);
  };

  return (
    <ApiConfigContext.Provider value={{ apiBaseUrl, setApiBaseUrl, resetToDefault }}>
      {children}
    </ApiConfigContext.Provider>
  );
};

export const useApiConfig = (): ApiConfigContextType => {
  const context = useContext(ApiConfigContext);
  if (context === undefined) {
    throw new Error('useApiConfig must be used within an ApiConfigProvider');
  }
  return context;
};
