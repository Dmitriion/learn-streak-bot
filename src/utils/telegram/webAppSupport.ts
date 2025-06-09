
import LoggingService from '../../services/LoggingService';

const logger = LoggingService.getInstance();

/**
 * Проверяет поддержку конкретного метода в Telegram WebApp API
 */
export function isMethodSupported(methodName: string): boolean {
  const webApp = window.Telegram?.WebApp;
  if (!webApp) return false;
  
  return typeof (webApp as any)[methodName] === 'function';
}

/**
 * Проверяет поддержку конкретного свойства в Telegram WebApp API
 */
export function isPropertySupported(propertyName: string): boolean {
  const webApp = window.Telegram?.WebApp;
  if (!webApp) return false;
  
  return (webApp as any)[propertyName] !== undefined;
}

/**
 * Получает версию Telegram WebApp API
 */
export function getWebAppVersion(): string {
  return window.Telegram?.WebApp?.version || 'unknown';
}

/**
 * Проверяет, поддерживается ли подтверждение закрытия
 */
export function isClosingConfirmationSupported(): boolean {
  return isMethodSupported('enableClosingConfirmation') && 
         isMethodSupported('disableClosingConfirmation');
}

/**
 * Проверяет, поддерживается ли установка цвета заголовка
 */
export function isHeaderColorSupported(): boolean {
  return isMethodSupported('setHeaderColor');
}

/**
 * Безопасно вызывает метод enableClosingConfirmation
 */
export function safeEnableClosingConfirmation(): boolean {
  const webApp = window.Telegram?.WebApp;
  if (!webApp || !isClosingConfirmationSupported()) {
    logger.debug('enableClosingConfirmation не поддерживается в текущей версии');
    return false;
  }
  
  try {
    webApp.enableClosingConfirmation!();
    logger.debug('Подтверждение закрытия включено');
    return true;
  } catch (error) {
    logger.error('Ошибка при включении подтверждения закрытия', { error });
    return false;
  }
}

/**
 * Безопасно вызывает метод disableClosingConfirmation
 */
export function safeDisableClosingConfirmation(): boolean {
  const webApp = window.Telegram?.WebApp;
  if (!webApp || !isClosingConfirmationSupported()) {
    logger.debug('disableClosingConfirmation не поддерживается в текущей версии');
    return false;
  }
  
  try {
    webApp.disableClosingConfirmation!();
    logger.debug('Подтверждение закрытия отключено');
    return true;
  } catch (error) {
    logger.error('Ошибка при отключении подтверждения закрытия', { error });
    return false;
  }
}

/**
 * Логирует информацию о возможностях WebApp API
 */
export function logWebAppCapabilities(): void {
  const webApp = window.Telegram?.WebApp;
  if (!webApp) {
    logger.info('Telegram WebApp API недоступен');
    return;
  }

  const capabilities = {
    version: getWebAppVersion(),
    platform: webApp.platform || 'unknown',
    viewportHeight: webApp.viewportHeight || 'unknown',
    isExpanded: webApp.isExpanded || false,
    closingConfirmationSupported: isClosingConfirmationSupported(),
    headerColorSupported: isHeaderColorSupported()
  };

  logger.info('Возможности Telegram WebApp API', capabilities);
}
