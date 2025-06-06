
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import WebApp from '@twa-dev/sdk';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface TelegramContextType {
  user: TelegramUser | null;
  isReady: boolean;
  theme: 'light' | 'dark';
  showMainButton: (text: string, onClick: () => void) => void;
  hideMainButton: () => void;
  showBackButton: (onClick: () => void) => void;
  hideBackButton: () => void;
  hapticFeedback: (type: 'light' | 'medium' | 'heavy') => void;
  showAlert: (message: string) => void;
  showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
  expand: () => void;
  ready: () => void;
}

const TelegramContext = createContext<TelegramContextType | null>(null);

interface TelegramProviderProps {
  children: ReactNode;
}

export const TelegramProvider: React.FC<TelegramProviderProps> = ({ children }) => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Инициализация Telegram Web App
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      WebApp.ready();
      WebApp.expand();
      
      // Получаем данные пользователя
      if (WebApp.initDataUnsafe?.user) {
        setUser(WebApp.initDataUnsafe.user as TelegramUser);
      }
      
      // Устанавливаем тему
      setTheme(WebApp.colorScheme as 'light' | 'dark');
      
      // Настраиваем обработчики событий
      WebApp.onEvent('themeChanged', () => {
        setTheme(WebApp.colorScheme as 'light' | 'dark');
      });
      
      setIsReady(true);
    } else {
      // Фоллбэк для разработки вне Telegram
      console.warn('Telegram Web App не доступен, используем тестовые данные');
      setUser({
        id: 12345,
        first_name: 'Анна',
        last_name: 'Петрова',
        username: 'anna_petrova',
        language_code: 'ru'
      });
      setIsReady(true);
    }
  }, []);

  const showMainButton = (text: string, onClick: () => void) => {
    if (WebApp.MainButton) {
      WebApp.MainButton.setText(text);
      WebApp.MainButton.show();
      WebApp.MainButton.onClick(onClick);
    }
  };

  const hideMainButton = () => {
    if (WebApp.MainButton) {
      WebApp.MainButton.hide();
    }
  };

  const showBackButton = (onClick: () => void) => {
    if (WebApp.BackButton) {
      WebApp.BackButton.show();
      WebApp.BackButton.onClick(onClick);
    }
  };

  const hideBackButton = () => {
    if (WebApp.BackButton) {
      WebApp.BackButton.hide();
    }
  };

  const hapticFeedback = (type: 'light' | 'medium' | 'heavy') => {
    if (WebApp.HapticFeedback) {
      switch (type) {
        case 'light':
          WebApp.HapticFeedback.impactOccurred('light');
          break;
        case 'medium':
          WebApp.HapticFeedback.impactOccurred('medium');
          break;
        case 'heavy':
          WebApp.HapticFeedback.impactOccurred('heavy');
          break;
      }
    }
  };

  const showAlert = (message: string) => {
    if (WebApp.showAlert) {
      WebApp.showAlert(message);
    } else {
      alert(message);
    }
  };

  const showConfirm = (message: string, callback: (confirmed: boolean) => void) => {
    if (WebApp.showConfirm) {
      WebApp.showConfirm(message, callback);
    } else {
      callback(confirm(message));
    }
  };

  const expand = () => {
    if (WebApp.expand) {
      WebApp.expand();
    }
  };

  const ready = () => {
    if (WebApp.ready) {
      WebApp.ready();
    }
  };

  const value: TelegramContextType = {
    user,
    isReady,
    theme,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    hapticFeedback,
    showAlert,
    showConfirm,
    expand,
    ready
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram должен использоваться внутри TelegramProvider');
  }
  return context;
};
