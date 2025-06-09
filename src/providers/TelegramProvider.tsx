
import React from 'react';
import TelegramContext from '../contexts/TelegramContext';
import { useTelegramWebApp } from '../hooks/useTelegramWebApp';
import { useTelegramAuth } from '../hooks/useTelegramAuth';
import { TelegramProviderProps, TelegramContextType } from '../types/TelegramTypes';

export const TelegramProvider: React.FC<TelegramProviderProps> = ({ children }) => {
  const webAppFeatures = useTelegramWebApp();
  const authFeatures = useTelegramAuth();

  const value: TelegramContextType = {
    ...authFeatures,
    ...webAppFeatures,
    // Добавляем недостающие обязательные поля
    isInitialized: webAppFeatures.isInitialized || false,
    themeParams: webAppFeatures.themeParams || {},
    platform: webAppFeatures.platform || 'web',
    version: webAppFeatures.version || '1.0'
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
};

export { useTelegram } from '../contexts/TelegramContext';
