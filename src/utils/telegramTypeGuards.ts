
/**
 * Переэкспорт всех Telegram utilities для обратной совместимости
 */

// API проверки
export {
  isTelegramWebAppAvailable,
  hasTelegramUser,
  hasMainButton,
  hasBackButton,
  hasHapticFeedback,
  hasCloudStorage,
  hasPayments
} from './telegram/apiChecks';

// Type guards
export {
  isValidTelegramUser,
  isValidTelegramChat,
  isValidTelegramInitData,
  isValidTelegramUserRegistrationData,
  isValidTelegramMetrics,
  isValidationResult
} from './telegram/typeGuards';

// Валидаторы
export {
  isValidTelegramUserId,
  isValidTelegramUsername,
  isValidLanguageCode
} from './telegram/validators';

// Безопасные геттеры
export {
  getTelegramUser,
  getTelegramChat,
  getTelegramWebApp,
  getTelegramInitData
} from './telegram/safeGetters';

// WebApp поддержка
export {
  isMethodSupported,
  isPropertySupported,
  getWebAppVersion,
  isClosingConfirmationSupported,
  isHeaderColorSupported,
  safeEnableClosingConfirmation,
  safeDisableClosingConfirmation,
  logWebAppCapabilities
} from './telegram/webAppSupport';
