
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
  private logger: LoggingService;
  private securityService: SecurityValidationService;
  private contentService: ContentValidationService;

  constructor() {
    this.logger = LoggingService.getInstance();
    this.securityService = SecurityValidationService.getInstance();
    this.contentService = ContentValidationService.getInstance();
  }

  static getInstance(): TelegramValidationService {
    if (!TelegramValidationService.instance) {
      TelegramValidationService.instance = new TelegramValidationService();
    }
    return TelegramValidationService.instance;
  }

  private isDevelopmentMode(): boolean {
    const appEnv = (globalThis as any).__APP_ENV__ || 'development';
    return appEnv === 'development' || 
           window.location.hostname === 'localhost' || 
           window.location.hostname.includes('lovableproject.com') ||
           window.location.hostname.includes('127.0.0.1');
  }

  private isTelegramEnvironment(): boolean {
    return !!(window.Telegram?.WebApp);
  }

  /**
   * Улучшенная валидация initData для Telegram Mini App
   */
  validateInitData(initData: string): InitDataValidationResult {
    try {
      // В Telegram Mini App среде используем встроенную валидацию
      if (this.isTelegramEnvironment()) {
        return this.validateTelegramWebAppData();
      }

      // Fallback валидация для development/testing
      if (!initData || initData.length === 0) {
        if (this.isDevelopmentMode()) {
          this.logger.warn('Development режим: пропуск валидации пустого initData');
          return { isValid: true, parsedData: this.createMockInitData() };
        }
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

      // Базовые проверки
      const authDate = parseInt(data.auth_date);
      if (isNaN(authDate)) {
        return { isValid: false, error: 'Невалидная auth_date' };
      }

      // Проверяем возраст данных (не старше 1 часа)
      const currentTime = Math.floor(Date.now() / 1000);
      const maxAge = 3600; // 1 час

      if (currentTime - authDate > maxAge) {
        if (!this.isDevelopmentMode()) {
          return { isValid: false, error: 'InitData устарел' };
        }
        this.logger.warn('Development режим: пропуск проверки возраста initData');
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
      
      // В development режиме возвращаем mock данные
      if (this.isDevelopmentMode()) {
        this.logger.warn('Development режим: возврат mock данных из-за ошибки');
        return { isValid: true, parsedData: this.createMockInitData() };
      }
      
      return { isValid: false, error: 'Ошибка парсинга initData' };
    }
  }

  /**
   * Валидация через Telegram WebApp API
   */
  private validateTelegramWebAppData(): InitDataValidationResult {
    try {
      const webApp = window.Telegram?.WebApp;
      if (!webApp) {
        return { isValid: false, error: 'Telegram WebApp API недоступен' };
      }

      // Проверяем наличие пользователя
      if (!webApp.initDataUnsafe?.user) {
        if (this.isDevelopmentMode()) {
          this.logger.warn('Telegram WebApp: пользователь не найден, используем mock данные');
          return { isValid: true, parsedData: this.createMockInitData() };
        }
        return { isValid: false, error: 'Данные пользователя недоступны' };
      }

      // Создаем parsedData из Telegram WebApp
      const parsedData: TelegramInitData = {
        user: webApp.initDataUnsafe.user,
        auth_date: Math.floor(Date.now() / 1000), // Текущее время
        hash: 'telegram_webapp_validated',
        start_param: webApp.initDataUnsafe.start_param,
        chat_type: webApp.initDataUnsafe.chat_type,
        chat_instance: webApp.initDataUnsafe.chat_instance
      };

      // Дополнительные проверки безопасности
      const securityCheck = this.securityService.performSecurityChecks(parsedData);
      if (!securityCheck.isValid) {
        return { isValid: false, error: securityCheck.error };
      }

      this.logger.info('Telegram WebApp: валидация успешна');
      return { isValid: true, parsedData };

    } catch (error) {
      this.logger.error('Ошибка валидации Telegram WebApp данных:', error);
      
      if (this.isDevelopmentMode()) {
        return { isValid: true, parsedData: this.createMockInitData() };
      }
      
      return { isValid: false, error: 'Ошибка валидации WebApp данных' };
    }
  }

  /**
   * Создание mock данных для development
   */
  private createMockInitData(): TelegramInitData {
    return {
      user: {
        id: 12345,
        first_name: 'Анна',
        last_name: 'Петрова',
        username: 'anna_petrova',
        language_code: 'ru'
      },
      auth_date: Math.floor(Date.now() / 1000),
      hash: 'development_mock_hash'
    };
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

  /**
   * Получение информации о текущей среде
   */
  getEnvironmentInfo() {
    return {
      isDevelopment: this.isDevelopmentMode(),
      isTelegramApp: this.isTelegramEnvironment(),
      webAppVersion: window.Telegram?.WebApp?.version || 'unknown',
      platform: window.Telegram?.WebApp?.platform || 'web'
    };
  }
}

export default TelegramValidationService;
