
import React from 'react';
import TelegramContext from '../contexts/TelegramContext';
import { useTelegramWebApp } from '../hooks/useTelegramWebApp';
import { useTelegramAuth } from '../hooks/useTelegramAuth';
import { TelegramProviderProps, TelegramContextType, TelegramPaymentStatus } from '../types/TelegramTypes';

export const TelegramProvider: React.FC<TelegramProviderProps> = ({ children }) => {
  const webAppFeatures = useTelegramWebApp();
  const authFeatures = useTelegramAuth();

  // Приводим типы к соответствию TelegramContextType
  const value: TelegramContextType = {
    ...authFeatures,
    ...webAppFeatures,
    // Исправляем типы для обязательных полей
    isInitialized: webAppFeatures.isReady || false,
    themeParams: webAppFeatures.themeParams || {},
    platform: webAppFeatures.platform || 'web',
    version: webAppFeatures.version || '1.0',
    // Исправляем типы для openInvoice
    openInvoice: (url: string, callback?: (status: TelegramPaymentStatus) => void) => {
      if (webAppFeatures.openInvoice) {
        webAppFeatures.openInvoice(url, callback ? (status: string) => {
          callback(status as TelegramPaymentStatus);
        } : undefined);
      }
    }
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
};

export { useTelegram } from '../contexts/TelegramContext';
