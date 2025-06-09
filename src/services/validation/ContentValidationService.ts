
import { TelegramUser, TelegramUserValidationResult } from '../auth/types';
import SecurityValidationService from './SecurityValidationService';
import { isValidTelegramUser, isValidTelegramUserId, isValidTelegramUsername } from '../../utils/telegramTypeGuards';

class ContentValidationService {
  private static instance: ContentValidationService;
  private securityService: SecurityValidationService;

  constructor() {
    this.securityService = SecurityValidationService.getInstance();
  }

  static getInstance(): ContentValidationService {
    if (!ContentValidationService.instance) {
      ContentValidationService.instance = new ContentValidationService();
    }
    return ContentValidationService.instance;
  }

  /**
   * Валидация данных пользователя Telegram с использованием type guards
   */
  validateUserData(telegramUser: TelegramUser): TelegramUserValidationResult {
    const warnings: string[] = [];

    // Базовая проверка структуры с помощью type guard
    if (!isValidTelegramUser(telegramUser)) {
      return { isValid: false, error: 'Невалидная структура данных пользователя' };
    }

    // Проверка ID пользователя
    if (!isValidTelegramUserId(telegramUser.id)) {
      warnings.push('Подозрительный ID пользователя');
    }

    // Проверка username
    if (telegramUser.username && !isValidTelegramUsername(telegramUser.username)) {
      warnings.push('Невалидный формат username');
    }

    // Проверка длины строк
    if (telegramUser.first_name && telegramUser.first_name.length > 256) {
      warnings.push('Слишком длинное имя');
    }

    if (telegramUser.last_name && telegramUser.last_name.length > 256) {
      warnings.push('Слишком длинная фамилия');
    }

    // Проверка на XSS и подозрительное содержимое
    const textFields = [telegramUser.first_name, telegramUser.last_name, telegramUser.username];
    for (const field of textFields) {
      if (field && this.securityService.containsSuspiciousContent(field)) {
        warnings.push('Подозрительное содержимое в данных');
        break;
      }
    }

    // Проверка языкового кода
    if (telegramUser.language_code && !this.isValidLanguageCode(telegramUser.language_code)) {
      warnings.push('Невалидный языковой код');
    }

    return { 
      isValid: warnings.length === 0, 
      warnings: warnings.length > 0 ? warnings : undefined 
    };
  }

  /**
   * Проверка корректности языкового кода
   */
  private isValidLanguageCode(code: string): boolean {
    // ISO 639-1 (2 символа) или ISO 639-1 + ISO 3166-1 (5 символов с дефисом)
    const langCodeRegex = /^[a-z]{2}(-[A-Z]{2})?$/;
    return langCodeRegex.test(code);
  }
}

export default ContentValidationService;
