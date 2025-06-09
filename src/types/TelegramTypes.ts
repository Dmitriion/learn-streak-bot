
/**
 * Главный файл экспорта всех Telegram типов
 * Обеспечивает обратную совместимость
 */

// Пользователи и чаты
export type {
  TelegramUser,
  TelegramChat,
  TelegramChatPhoto,
  TgUser,
  TgChat
} from './telegram/User';

// WebApp API
export type {
  TelegramInitData,
  TelegramThemeParams,
  TelegramViewport,
  TelegramMainButton,
  TelegramBackButton,
  TelegramSettingsButton,
  TgInitData
} from './telegram/WebApp';

// События и обратная связь
export type {
  TelegramEventType,
  TelegramHapticFeedbackType,
  TelegramNotificationFeedbackType,
  TelegramPaymentStatus
} from './telegram/Events';

// Состояния
export type {
  TelegramAuthState,
  TelegramWebAppState
} from './telegram/State';

// Данные приложения
export type {
  TelegramUserRegistrationData,
  TelegramMetrics
} from './telegram/Data';

// Валидация
export type {
  TelegramValidationResult,
  TelegramUserValidationResult,
  TelegramInitDataValidationResult
} from './telegram/Validation';

// Контекст и провайдеры
export type {
  TelegramContextType,
  TelegramProviderProps
} from './telegram/Context';
