import LoggingService from './LoggingService';
import SecurityValidationService from './validation/SecurityValidationService';
import ContentValidationService from './validation/ContentValidationService';
import { 
  TelegramInitData, 
  TelegramUser, 
  InitDataValidationResult, 
  UserValidationResult, 
  ValidationResult 
} from './auth/types';
import { 
  isTelegramWebAppAvailable, 
  hasTelegramUser, 
  isValidTelegramUser 
} from '../utils/telegramTypeGuards';

interface ParsedInitData {
  user?: TelegramUser;
  auth_date?: number;
  hash?: string;
  start_param?: string;
  chat_type?: string;
  chat_instance?: string;
  [key: string]: string | number | TelegramUser | undefined;
}

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
    const appEnv = (globalThis as { __APP_ENV__?: string }).__APP_ENV__ || 'development';
    return appEnv === 'development' || 
           window.location.hostname === 'localhost' || 
           window.location.hostname.includes('lovableproject.com') ||
           window.location.hostname.includes('127.0.0.1');
  }

  private isTelegramEnvironment(): boolean {
    return isTelegramWebAppAvailable();
  }

  validateInitData(initData: string): InitDataValidationResult {
    try {
      if (this.isTelegramEnvironment()) {
        return this.validateTelegramWebAppData();
      }

      if (!initData || initData.length === 0) {
        if (this.isDevelopmentMode()) {
          this.logger.warn('Development режим: пропуск валидации пустого initData');
          return { isValid: true, parsedData: this.createMockInitData() };
        }
        return { isValid: false, error: 'InitData пуст' };
      }

      const urlParams = new URLSearchParams(initData);
      const data: ParsedInitData = {};
      
      for (const [key, value] of urlParams.entries()) {
        if (key === 'user') {
          try {
            const parsedUser = JSON.parse(value);
            if (isValidTelegramUser(parsedUser)) {
              data[key] = parsedUser;
            } else {
              return { isValid: false, error: 'Невалидные данные пользователя' };
            }
          } catch {
            return { isValid: false, error: 'Невалидные данные пользователя' };
          }
        } else if (key === 'auth_date') {
          data[key] = parseInt(value);
        } else {
          data[key] = value;
        }
      }

      const authDate = data.auth_date;
      if (!authDate || isNaN(authDate)) {
        return { isValid: false, error: 'Невалидная auth_date' };
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const maxAge = 3600;

      if (currentTime - authDate > maxAge) {
        if (!this.isDevelopmentMode()) {
          return { isValid: false, error: 'InitData устарел' };
        }
        this.logger.warn('Development режим: пропуск проверки возраста initData');
      }

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
      
      if (this.isDevelopmentMode()) {
        this.logger.warn('Development режим: возврат mock данных из-за ошибки');
        return { isValid: true, parsedData: this.createMockInitData() };
      }
      
      return { isValid: false, error: 'Ошибка парсинга initData' };
    }
  }

  private validateTelegramWebAppData(): InitDataValidationResult {
    try {
      const webApp = window.Telegram?.WebApp;
      if (!webApp) {
        return { isValid: false, error: 'Telegram WebApp API недоступен' };
      }

      if (!hasTelegramUser()) {
        if (this.isDevelopmentMode()) {
          this.logger.warn('Telegram WebApp: пользователь не найден, используем mock данные');
          return { isValid: true, parsedData: this.createMockInitData() };
        }
        return { isValid: false, error: 'Данные пользователя недоступны' };
      }

      const user = webApp.initDataUnsafe.user;
      if (!isValidTelegramUser(user)) {
        return { isValid: false, error: 'Невалидные данные пользователя' };
      }

      const parsedData: TelegramInitData = {
        user,
        auth_date: Math.floor(Date.now() / 1000),
        hash: 'telegram_webapp_validated',
        start_param: webApp.initDataUnsafe.start_param,
        chat_type: webApp.initDataUnsafe.chat_type,
        chat_instance: webApp.initDataUnsafe.chat_instance
      };

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

  validateUserData(telegramUser: TelegramUser): UserValidationResult {
    return this.contentService.validateUserData(telegramUser);
  }

  validateWebhookUrl(url: string): ValidationResult {
    return this.securityService.validateWebhookUrl(url);
  }

  validateNonce(nonce: string): boolean {
    return this.securityService.validateNonce(nonce);
  }

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
