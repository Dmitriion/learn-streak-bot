
import { TelegramUser } from '../services/auth/types';

/**
 * Type guard для проверки доступности Telegram WebApp
 */
export function isTelegramWebAppAvailable(): boolean {
  return typeof window !== 'undefined' && 
         window.Telegram !== undefined && 
         window.Telegram.WebApp !== undefined;
}

/**
 * Type guard для проверки наличия пользователя в Telegram WebApp
 */
export function hasTelegramUser(): boolean {
  return isTelegramWebAppAvailable() && 
         window.Telegram.WebApp.initDataUnsafe !== undefined &&
         window.Telegram.WebApp.initDataUnsafe.user !== undefined;
}

/**
 * Type guard для проверки валидности данных пользователя Telegram
 */
export function isValidTelegramUser(user: unknown): user is TelegramUser {
  if (!user || typeof user !== 'object') {
    return false;
  }

  const u = user as Record<string, unknown>;
  return typeof u.id === 'number' &&
         typeof u.first_name === 'string' &&
         u.first_name.length > 0;
}

/**
 * Type guard для проверки доступности MainButton
 */
export function hasMainButton(): boolean {
  return isTelegramWebAppAvailable() && 
         window.Telegram.WebApp.MainButton !== undefined;
}

/**
 * Type guard для проверки доступности BackButton
 */
export function hasBackButton(): boolean {
  return isTelegramWebAppAvailable() && 
         window.Telegram.WebApp.BackButton !== undefined;
}

/**
 * Type guard для проверки доступности HapticFeedback
 */
export function hasHapticFeedback(): boolean {
  return isTelegramWebAppAvailable() && 
         window.Telegram.WebApp.HapticFeedback !== undefined;
}

/**
 * Type guard для проверки доступности CloudStorage
 */
export function hasCloudStorage(): boolean {
  return isTelegramWebAppAvailable() && 
         window.Telegram.WebApp.CloudStorage !== undefined;
}

/**
 * Безопасное получение пользователя Telegram
 */
export function getTelegramUser(): TelegramUser | null {
  if (!hasTelegramUser()) {
    return null;
  }

  const user = window.Telegram.WebApp.initDataUnsafe.user;
  return isValidTelegramUser(user) ? user : null;
}

/**
 * Безопасное получение WebApp
 */
export function getTelegramWebApp() {
  return isTelegramWebAppAvailable() ? window.Telegram.WebApp : null;
}
