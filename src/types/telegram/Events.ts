
/**
 * Типы событий и обратной связи Telegram
 */

/**
 * Типы событий Telegram WebApp
 */
export type TelegramEventType = 
  | 'themeChanged'
  | 'viewportChanged'
  | 'mainButtonClicked'
  | 'backButtonClicked'
  | 'settingsButtonClicked'
  | 'invoiceClosed'
  | 'popupClosed'
  | 'qrTextReceived'
  | 'clipboardTextReceived'
  | 'writeAccessRequested'
  | 'contactRequested';

/**
 * Параметры haptic feedback
 */
export type TelegramHapticFeedbackType = 'light' | 'medium' | 'heavy';
export type TelegramNotificationFeedbackType = 'error' | 'success' | 'warning';

/**
 * Статус платежа
 */
export type TelegramPaymentStatus = 'paid' | 'cancelled' | 'failed' | 'pending';
