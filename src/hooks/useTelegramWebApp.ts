
import { useState, useEffect, useCallback } from 'react';

export const useTelegramWebApp = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const WebApp = window.Telegram.WebApp;
      
      WebApp.ready();
      WebApp.expand();
      
      setTheme(WebApp.colorScheme as 'light' | 'dark');
      
      WebApp.onEvent('themeChanged', () => {
        setTheme(WebApp.colorScheme as 'light' | 'dark');
      });
      
      setIsReady(true);
    } else {
      console.warn('Telegram Web App не доступен, используем тестовые данные');
      setIsReady(true);
    }
  }, []);

  const showMainButton = useCallback((text: string, onClick: () => void) => {
    if (window.Telegram?.WebApp?.MainButton) {
      const MainButton = window.Telegram.WebApp.MainButton;
      MainButton.setText(text);
      MainButton.show();
      MainButton.onClick(onClick);
    }
  }, []);

  const hideMainButton = useCallback(() => {
    if (window.Telegram?.WebApp?.MainButton) {
      window.Telegram.WebApp.MainButton.hide();
    }
  }, []);

  const showBackButton = useCallback((onClick: () => void) => {
    if (window.Telegram?.WebApp?.BackButton) {
      const BackButton = window.Telegram.WebApp.BackButton;
      BackButton.show();
      BackButton.onClick(onClick);
    }
  }, []);

  const hideBackButton = useCallback(() => {
    if (window.Telegram?.WebApp?.BackButton) {
      window.Telegram.WebApp.BackButton.hide();
    }
  }, []);

  const hapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
    }
  }, []);

  const showAlert = useCallback((message: string) => {
    if (window.Telegram?.WebApp?.showAlert) {
      window.Telegram.WebApp.showAlert(message);
    } else {
      alert(message);
    }
  }, []);

  const showConfirm = useCallback((message: string, callback: (confirmed: boolean) => void) => {
    if (window.Telegram?.WebApp?.showConfirm) {
      window.Telegram.WebApp.showConfirm(message, callback);
    } else {
      callback(confirm(message));
    }
  }, []);

  const expand = useCallback(() => {
    if (window.Telegram?.WebApp?.expand) {
      window.Telegram.WebApp.expand();
    }
  }, []);

  const ready = useCallback(() => {
    if (window.Telegram?.WebApp?.ready) {
      window.Telegram.WebApp.ready();
    }
  }, []);

  return {
    theme,
    isReady,
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
};
