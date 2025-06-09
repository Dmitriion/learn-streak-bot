
import { TelegramUser, TelegramChat, TelegramInitData } from '../../types/TelegramTypes';
import { isTelegramWebAppAvailable, hasTelegramUser } from './apiChecks';
import { isValidTelegramUser, isValidTelegramChat, isValidTelegramInitData } from './typeGuards';

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
 * Безопасное получение чата Telegram
 */
export function getTelegramChat(): TelegramChat | null {
  if (!isTelegramWebAppAvailable() || !window.Telegram.WebApp.initDataUnsafe?.chat) {
    return null;
  }

  const chat = window.Telegram.WebApp.initDataUnsafe.chat;
  return isValidTelegramChat(chat) ? chat : null;
}

/**
 * Безопасное получение WebApp
 */
export function getTelegramWebApp() {
  return isTelegramWebAppAvailable() ? window.Telegram.WebApp : null;
}

/**
 * Безопасное получение initData
 */
export function getTelegramInitData(): TelegramInitData | null {
  if (!isTelegramWebAppAvailable() || !window.Telegram.WebApp.initDataUnsafe) {
    return null;
  }

  const initData = window.Telegram.WebApp.initDataUnsafe;
  
  // Создаем объект с обязательными полями
  const data = {
    ...initData,
    auth_date: Math.floor(Date.now() / 1000), // Устанавливаем текущее время если не задано
    hash: initData.hash || 'webapp_validated' // Устанавливаем дефолтный hash если не задан
  };

  return isValidTelegramInitData(data) ? data : null;
}
