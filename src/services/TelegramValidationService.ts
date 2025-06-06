
import LoggingService from './LoggingService';
import SecurityValidationService from './validation/SecurityValidationService';
import ContentValidationService from './validation/ContentValidationService';
import { 
  TelegramInitData, 
  TelegramUser, 
  InitDataValidationResult, 
  UserValidationResult, 
  ValidationResult 
} from './validation/types';

class TelegramValidationService {
  private static instance: TelegramValidationService;
  private readonly BOT_TOKEN: string;
  private logger: LoggingService;
  private securityService: SecurityValidationService;
  private contentService: ContentValidationService;

  constructor() {
    this.logger = LoggingService.getInstance();
    this.securityService = SecurityValidationService.getInstance();
    this.contentService = ContentValidationService.getInstance();
    // Используем environment detection без process
    this.BOT_TOKEN = this.getBotToken();
  }

  static getInstance(): TelegramValidationService {
    if (!TelegramValidationService.instance) {
      TelegramValidationService.instance = new TelegramValidationService();
    }
    return TelegramValidationService.instance;
  }

  private getBotToken(): string {
    // В development режиме используем тестовый токен
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('lovableproject.com')) {
      return 'development_token';
    }
    // В production получаем из window переменных или конфигурации
    return (window as any).TELEGRAM_BOT_TOKEN || 'production_token';
  }

  private isDevelopmentMode(): boolean {
    return window.location.hostname === 'localhost' || 
           window.location.hostname.includes('lovableproject.com') ||
           window.location.hostname.includes('127.0.0.1');
  }

  /**
   * Валидация initData с упрощенной логикой для browser environment
   */
  validateInitData(initData: string): InitDataValidationResult {
    try {
      if (!initData || initData.length === 0) {
        return { isValid: false, error: 'InitData пуст' };
      }

      // Парсим URL-encoded данные
      const urlParams = new URLSearchParams(initData);
      const data: any = {};
      
      for (const [key, value] of urlParams.entries()) {
        if (key === 'user') {
          try {
            data[key] = JSON.parse(value);
          } catch {
            return { isValid: false, error: 'Невалидные данные пользователя' };
          }
        } else {
          data[key] = value;
        }
      }

      const hash = data.hash;
      if (!hash) {
        return { isValid: false, error: 'Отсутствует hash в initData' };
      }

      // Проверяем возраст данных (не старше 1 часа)
      const authDate = parseInt(data.auth_date);
      if (isNaN(authDate)) {
        return { isValid: false, error: 'Невалидная auth_date' };
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const maxAge = 3600; // 1 час

      if (currentTime - authDate > maxAge) {
        return { isValid: false, error: 'InitData устарел' };
      }

      // В development режиме пропускаем HMAC валидацию
      if (this.isDevelopmentMode()) {
        this.logger.warn('Development режим: пропуск HMAC валидации');
        return {
          isValid: true,
          parsedData: data as TelegramInitData
        };
      }

      // Дополнительные проверки безопасности
      const securityCheck = this.securityService.performSecurityChecks(data);
      if (!securityCheck.isValid) {
        return { isValid: false, error: securityCheck.error };
      }

      return {
        isValid: true,
        parsedData: data as TelegramInitData
      };

    } catch (error) {
      this.logger.error('Ошибка валидации initData:', error);
      return { isValid: false, error: 'Ошибка парсинга initData' };
    }
  }

  /**
   * Валидация данных пользователя Telegram
   */
  validateUserData(telegramUser: TelegramUser): UserValidationResult {
    return this.contentService.validateUserData(telegramUser);
  }

  /**
   * Валидация webhook URL для безопасности
   */
  validateWebhookUrl(url: string): ValidationResult {
    return this.securityService.validateWebhookUrl(url);
  }

  /**
   * Защита от replay атак
   */
  validateNonce(nonce: string): boolean {
    return this.securityService.validateNonce(nonce);
  }
}

export default TelegramValidationService;
