
import { useState, useEffect } from 'react';
import AuthService, { TelegramUser, AuthState } from '../services/AuthService';
import UserRegistrationService from '../services/UserRegistrationService';

export const useTelegramAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isRegistered: false,
    user: null,
    registrationStatus: 'idle'
  });

  const authService = AuthService.getInstance();
  const registrationService = UserRegistrationService.getInstance();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      if (window.Telegram.WebApp.initDataUnsafe?.user) {
        const telegramUser = window.Telegram.WebApp.initDataUnsafe.user as TelegramUser;
        handleAuthentication(telegramUser);
      }
    } else {
      // Фоллбэк для разработки вне Telegram
      const testUser: TelegramUser = {
        id: 12345,
        first_name: 'Анна',
        last_name: 'Петрова',
        username: 'anna_petrova',
        language_code: 'ru'
      };
      handleAuthentication(testUser);
    }
  }, []);

  const handleAuthentication = async (telegramUser: TelegramUser) => {
    setAuthState(prev => ({ ...prev, registrationStatus: 'checking' }));
    
    try {
      const newAuthState = await authService.authenticateUser(telegramUser);
      setAuthState(newAuthState);
      
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

  return {
    ...authState,
    registerUser,
    setWebhookUrl
  };
};
