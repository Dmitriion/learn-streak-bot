
import { TelegramUser, UserValidationResult } from '../auth/types';
import SecurityValidationService from './SecurityValidationService';

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
   * Валидация данных пользователя Telegram
   */
  validateUserData(telegramUser: TelegramUser): UserValidationResult {
    const warnings: string[] = [];

    // Проверка на подозрительные значения
    if (telegramUser.id < 0 || telegramUser.id > Number.MAX_SAFE_INTEGER) {
      warnings.push('Подозрительный ID пользователя');
    }

    // Проверка длины строк
    if (telegramUser.username && telegramUser.username.length > 32) {
      warnings.push('Слишком длинный username');
    }

    if (telegramUser.first_name && telegramUser.first_name.length > 256) {
      warnings.push('Слишком длинное имя');
    }

    // Проверка на XSS
    const textFields = [telegramUser.first_name, telegramUser.last_name, telegramUser.username];
    for (const field of textFields) {
      if (field && this.securityService.containsSuspiciousContent(field)) {
        warnings.push('Подозрительное содержимое в данных');
        break;
      }
    }

    return { 
      isValid: warnings.length === 0, 
      warnings: warnings.length > 0 ? warnings : undefined 
    };
  }
}

export default ContentValidationService;
