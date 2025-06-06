import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AuthService, { TelegramUser, AuthState } from '../services/AuthService';
import UserRegistrationService from '../services/UserRegistrationService';

interface TelegramContextType extends AuthState {
  showMainButton: (text: string, onClick: () => void) => void;
  hideMainButton: () => void;
  showBackButton: (onClick: () => void) => void;
  hideBackButton: () => void;
  hapticFeedback: (type: 'light' | 'medium' | 'heavy') => void;
  showAlert: (message: string) => void;
  showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
  expand: () => void;
  ready: () => void;
  theme: 'light' | 'dark';
  registerUser: (fullName: string) => Promise<void>;
  setWebhookUrl: (url: string) => void;
}

const TelegramContext = createContext<TelegramContextType | null>(null);

interface TelegramProviderProps {
  children: ReactNode;
}

export const TelegramProvider: React.FC<TelegramProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isRegistered: false,
    user: null,
    registrationStatus: 'idle'
  });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isReady, setIsReady] = useState(false);

  const authService = AuthService.getInstance();
  const registrationService = UserRegistrationService.getInstance();

  useEffect(() => {
    // Инициализация Telegram Web App
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const WebApp = window.Telegram.WebApp;
      
      WebApp.ready();
      WebApp.expand();
      
      // Устанавливаем тему
      setTheme(WebApp.colorScheme as 'light' | 'dark');
      
      // Настраиваем обработчики событий
      WebApp.onEvent('themeChanged', () => {
        setTheme(WebApp.colorScheme as 'light' | 'dark');
      });
      
      // Аутентификация пользователя
      if (WebApp.initDataUnsafe?.user) {
        const telegramUser = WebApp.initDataUnsafe.user as TelegramUser;
        handleAuthentication(telegramUser);
      }
      
      setIsReady(true);
    } else {
      // Фоллбэк для разработки вне Telegram
      console.warn('Telegram Web App не доступен, используем тестовые данные');
      const testUser: TelegramUser = {
        id: 12345,
        first_name: 'Анна',
        last_name: 'Петрова',
        username: 'anna_petrova',
        language_code: 'ru'
      };
      handleAuthentication(testUser);
      setIsReady(true);
    }
  }, []);

  const handleAuthentication = async (telegramUser: TelegramUser) => {
    setAuthState(prev => ({ ...prev, registrationStatus: 'checking' }));
    
    try {
      const newAuthState = await authService.authenticateUser(telegramUser);
      setAuthState(newAuthState);
      
      // Обновляем активность пользователя
      if (newAuthState.isRegistered) {
        await registrationService.updateUserActivity(telegramUser.id.toString());
      }
    } catch (error) {
      console.error('Ошибка аутентификации:', error);
      setAuthState({
        isAuthenticated: false,
        isRegistered: false,
        user: null,
        registrationStatus: 'error',
        error: 'Ошибка при загрузке профиля'
      });
    }
  };

  const registerUser = async (fullName: string) => {
    if (!authState.user) return;

    setAuthState(prev => ({ ...prev, registrationStatus: 'registering' }));
    
    try {
      const newAuthState = await authService.registerUser(authState.user, fullName);
      setAuthState(newAuthState);
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      setAuthState(prev => ({
        ...prev,
        registrationStatus: 'error',
        error: 'Ошибка при регистрации'
      }));
    }
  };

  const setWebhookUrl = (url: string) => {
    registrationService.setWebhookUrl(url);
  };

  const showMainButton = (text: string, onClick: () => void) => {
    if (window.Telegram?.WebApp?.MainButton) {
      const MainButton = window.Telegram.WebApp.MainButton;
      MainButton.setText(text);
      MainButton.show();
      MainButton.onClick(onClick);
    }
  };

  const hideMainButton = () => {
    if (window.Telegram?.WebApp?.MainButton) {
      window.Telegram.WebApp.MainButton.hide();
    }
  };

  const showBackButton = (onClick: () => void) => {
    if (window.Telegram?.WebApp?.BackButton) {
      const BackButton = window.Telegram.WebApp.BackButton;
      BackButton.show();
      BackButton.onClick(onClick);
    }
  };

  const hideBackButton = () => {
    if (window.Telegram?.WebApp?.BackButton) {
      window.Telegram.WebApp.BackButton.hide();
    }
  };

  const hapticFeedback = (type: 'light' | 'medium' | 'heavy') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
    }
  };

  const showAlert = (message: string) => {
    if (window.Telegram?.WebApp?.showAlert) {
      window.Telegram.WebApp.showAlert(message);
    } else {
      alert(message);
    }
  };

  const showConfirm = (message: string, callback: (confirmed: boolean) => void) => {
    if (window.Telegram?.WebApp?.showConfirm) {
      window.Telegram.WebApp.showConfirm(message, callback);
    } else {
      callback(confirm(message));
    }
  };

  const expand = () => {
    if (window.Telegram?.WebApp?.expand) {
      window.Telegram.WebApp.expand();
    }
  };

  const ready = () => {
    if (window.Telegram?.WebApp?.ready) {
      window.Telegram.WebApp.ready();
    }
  };

  const value: TelegramContextType = {
    ...authState,
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
    ready,
    registerUser,
    setWebhookUrl
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
