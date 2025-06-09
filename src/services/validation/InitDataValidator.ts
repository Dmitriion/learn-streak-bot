
import LoggingService from '../LoggingService';
import SecurityValidationService from './SecurityValidationService';
import { 
  TelegramInitData, 
  TelegramUser, 
  TelegramInitDataValidationResult 
} from '../../types/TelegramTypes';
import { 
  isTelegramWebAppAvailable, 
  hasTelegramUser, 
  isValidTelegramUser,
  isValidTelegramInitData,
  getTelegramInitData
} from '../../utils/telegramTypeGuards';

interface ParsedInitData {
  user?: TelegramUser;
  auth_date?: number;
  hash?: string;
  start_param?: string;
  chat_type?: string;
  chat_instance?: string;
  [key: string]: string | number | TelegramUser | undefined;
}

class InitDataValidator {
  private static instance: InitDataValidator;
  private logger: LoggingService;
  private securityService: SecurityValidationService;

  constructor() {
    this.logger = LoggingService.getInstance();
    this.securityService = SecurityValidationService.getInstance();
  }

  static getInstance(): InitDataValidator {
    if (!InitDataValidator.instance) {
      InitDataValidator.instance = new InitDataValidator();
    }
    return InitDataValidator.instance;
  }

  private isDevelopmentMode(): boolean {
    const appEnv = (globalThis as { __APP_ENV__?: string }).__APP_ENV__ || 'development';
    return appEnv === 'development' || 
           window.location.hostname === 'localhost' || 
           window.location.hostname.includes('lovableproject.com') ||
           window.location.hostname.includes('127.0.0.1');
  }

  validateInitData(initData: string): TelegramInitDataValidationResult {
    try {
      if (isTelegramWebAppAvailable()) {
        return this.validateTelegramWebAppData();
      }

      if (!initData || initData.length === 0) {
        if (this.isDevelopmentMode()) {
          this.logger.warn('Development режим: пропуск валидации пустого initData');
          return { isValid: true, parsedData: this.createMockInitData() };
        }
        return { isValid: false, error: 'InitData пуст' };
      }

      return this.parseAndValidateInitData(initData);

    } catch (error) {
      this.logger.error('Ошибка валидации initData:', error);
      
      if (this.isDevelopmentMode()) {
        this.logger.warn('Development режим: возврат mock данных из-за ошибки');
        return { isValid: true, parsedData: this.createMockInitData() };
      }
      
      return { isValid: false, error: 'Ошибка парсинга initData' };
    }
  }

  private parseAndValidateInitData(initData: string): TelegramInitDataValidationResult {
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

    if (!isValidTelegramInitData(data)) {
      return { isValid: false, error: 'Невалидная структура initData' };
    }

    const securityCheck = this.securityService.performSecurityChecks(data);
    if (!securityCheck.isValid) {
      return { isValid: false, error: securityCheck.error };
    }

    return {
      isValid: true,
      parsedData: data as TelegramInitData
    };
  }

  private validateTelegramWebAppData(): TelegramInitDataValidationResult {
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

      const initData = getTelegramInitData();
      if (!initData) {
        return { isValid: false, error: 'Невалидные данные WebApp' };
      }

      const securityCheck = this.securityService.performSecurityChecks(initData);
      if (!securityCheck.isValid) {
        return { isValid: false, error: securityCheck.error };
      }

      this.logger.info('Telegram WebApp: валидация успешна');
      return { isValid: true, parsedData: initData };

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
}

export default InitDataValidator;
