
/**
 * Типы валидации Telegram
 */

import { TelegramInitData } from './WebApp';

/**
 * Результат валидации
 */
export interface TelegramValidationResult {
  /** Валидация успешна */
  isValid: boolean;
  /** Ошибка валидации */
  error?: string;
  /** Предупреждения */
  warnings?: string[];
}

/**
 * Результат валидации пользователя
 */
export interface TelegramUserValidationResult extends TelegramValidationResult {
  /** Предупреждения для пользователя */
  warnings?: string[];
}

/**
 * Результат валидации InitData
 */
export interface TelegramInitDataValidationResult extends TelegramValidationResult {
  /** Распарсенные данные */
  parsedData?: TelegramInitData;
}
