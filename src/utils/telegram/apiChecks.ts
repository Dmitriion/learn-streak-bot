
/**
 * Базовые проверки доступности Telegram WebApp API
 */

/**
 * Проверка доступности Telegram WebApp API
 */
export function isTelegramWebAppAvailable(): boolean {
  return typeof window !== 'undefined' && 
         typeof window.Telegram !== 'undefined' && 
         typeof window.Telegram.WebApp !== 'undefined';
}

/**
 * Проверка наличия пользователя в Telegram WebApp
 */
export function hasTelegramUser(): boolean {
  return isTelegramWebAppAvailable() && 
         typeof window.Telegram.WebApp.initDataUnsafe !== 'undefined' &&
         typeof window.Telegram.WebApp.initDataUnsafe.user !== 'undefined';
}

/**
 * Проверка доступности MainButton
 */
export function hasMainButton(): boolean {
  return isTelegramWebAppAvailable() && 
         typeof window.Telegram.WebApp.MainButton !== 'undefined';
}

/**
 * Проверка доступности BackButton
 */
export function hasBackButton(): boolean {
  return isTelegramWebAppAvailable() && 
         typeof window.Telegram.WebApp.BackButton !== 'undefined';
}

/**
 * Проверка доступности HapticFeedback
 */
export function hasHapticFeedback(): boolean {
  return isTelegramWebAppAvailable() && 
         typeof window.Telegram.WebApp.HapticFeedback !== 'undefined';
}

/**
 * Проверка доступности CloudStorage
 */
export function hasCloudStorage(): boolean {
  return isTelegramWebAppAvailable() && 
         typeof window.Telegram.WebApp.CloudStorage !== 'undefined';
}

/**
 * Проверка поддержки платежей
 */
export function hasPayments(): boolean {
  return isTelegramWebAppAvailable() && 
         typeof window.Telegram.WebApp.openInvoice !== 'undefined';
}
