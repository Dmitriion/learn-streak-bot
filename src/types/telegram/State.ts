
/**
 * Типы состояний Telegram приложения
 */

import { TelegramUser } from './User';
import { TelegramThemeParams } from './WebApp';

/**
 * Состояние аутентификации
 */
export interface TelegramAuthState {
  /** Пользователь аутентифицирован */
  isAuthenticated: boolean;
  /** Пользователь зарегистрирован */
  isRegistered: boolean;
  /** Данные пользователя */
  user: TelegramUser | null;
  /** Статус регистрации */
  registrationStatus: 'idle' | 'checking' | 'registering' | 'success' | 'error';
  /** Ошибка */
  error?: string;
}

/**
 * Состояние WebApp
 */
export interface TelegramWebAppState {
  /** WebApp готов */
  isReady: boolean;
  /** WebApp инициализирован */
  isInitialized: boolean;
  /** Высота viewport */
  viewportHeight: number;
  /** WebApp расширен */
  isExpanded: boolean;
  /** Текущая тема */
  theme: 'light' | 'dark';
  /** Параметры темы */
  themeParams: TelegramThemeParams;
  /** Включено подтверждение закрытия */
  isClosingConfirmationEnabled: boolean;
  /** Платформа */
  platform: string;
  /** Версия */
  version: string;
}
