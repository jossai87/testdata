import { useState, useEffect } from 'react';
import { IDSettings } from './useStorage';

const SESSION_STORAGE_KEY = 'sessionSettings';

export const useSessionStorage = () => {
  const [sessionSettings, setSessionSettings] = useState<IDSettings>(() => {
    // Initialize from localStorage if exists
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {
      websocketId: '',
      agentId: '',
      aliasId: ''
    };
  });

  // Persist to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionSettings));
  }, [sessionSettings]);

  const updateSessionSettings = (newSettings: Partial<IDSettings>) => {
    setSessionSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  return {
    sessionSettings,
    updateSessionSettings
  };
};