
import { TelegramUser, TelegramUserValidationResult } from '../../types/TelegramTypes';
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

  validateUserData(telegramUser: TelegramUser): TelegramUserValidationResult {
    const warnings: string[] = [];

    if (!isValidTelegramUser(telegramUser)) {
      return { isValid: false, error: 'Невалидная структура данных пользователя' };
    }

    if (!isValidTelegramUserId(telegramUser.id)) {
      warnings.push('Подозрительный ID пользователя');
    }

    if (telegramUser.username && !isValidTelegramUsername(telegramUser.username)) {
      warnings.push('Невалидный формат username');
    }

    if (telegramUser.first_name && telegramUser.first_name.length > 256) {
      warnings.push('Слишком длинное имя');
    }

    if (telegramUser.last_name && telegramUser.last_name.length > 256) {
      warnings.push('Слишком длинная фамилия');
    }

    const textFields = [telegramUser.first_name, telegramUser.last_name, telegramUser.username];
    for (const field of textFields) {
      if (field && this.securityService.containsSuspiciousContent(field)) {
        warnings.push('Подозрительное содержимое в данных');
        break;
      }
    }

    if (telegramUser.language_code && !this.isValidLanguageCode(telegramUser.language_code)) {
      warnings.push('Невалидный языковой код');
    }

    return { 
      isValid: warnings.length === 0, 
      warnings: warnings.length > 0 ? warnings : undefined 
    };
  }

  private isValidLanguageCode(code: string): boolean {
    const langCodeRegex = /^[a-z]{2}(-[A-Z]{2})?$/;
    return langCodeRegex.test(code);
  }
}

export default ContentValidationService;
