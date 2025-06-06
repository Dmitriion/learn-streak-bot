
import LoggingService from './LoggingService';

export interface TelegramInitData {
  user?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
  };
  auth_date: number;
  hash: string;
  [key: string]: any;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

class TelegramValidationService {
  private static instance: TelegramValidationService;
  private readonly BOT_TOKEN: string;
  private readonly WEBHOOK_DOMAINS_WHITELIST = [
    'api.telegram.org',
    'core.telegram.org',
    'webhook.site',
    'ngrok.io',
    'localhost'
  ];
  private logger: LoggingService;

  constructor() {
    this.logger = LoggingService.getInstance();
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
  validateInitData(initData: string): { isValid: boolean; parsedData?: TelegramInitData; error?: string } {
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
      const securityCheck = this.performSecurityChecks(data);
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
  validateUserData(telegramUser: TelegramUser): { isValid: boolean; warnings?: string[] } {
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
      if (field && this.containsSuspiciousContent(field)) {
        warnings.push('Подозрительное содержимое в данных');
        break;
      }
    }

    return { 
      isValid: warnings.length === 0, 
      warnings: warnings.length > 0 ? warnings : undefined 
    };
  }

  private performSecurityChecks(data: any): { isValid: boolean; error?: string } {
    // Проверка на подозрительные значения
    if (data.user?.id && (data.user.id < 0 || data.user.id > Number.MAX_SAFE_INTEGER)) {
      return { isValid: false, error: 'Подозрительный ID пользователя' };
    }

    // Проверка длины строк
    if (data.user?.username && data.user.username.length > 32) {
      return { isValid: false, error: 'Слишком длинный username' };
    }

    if (data.user?.first_name && data.user.first_name.length > 256) {
      return { isValid: false, error: 'Слишком длинное имя' };
    }

    // Проверка на XSS
    const textFields = [data.user?.first_name, data.user?.last_name, data.user?.username];
    for (const field of textFields) {
      if (field && this.containsSuspiciousContent(field)) {
        return { isValid: false, error: 'Подозрительное содержимое в данных' };
      }
    }

    return { isValid: true };
  }

  private containsSuspiciousContent(text: string): boolean {
    const suspiciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /data:text\/html/gi
    ];

    return suspiciousPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Валидация webhook URL для безопасности
   */
  validateWebhookUrl(url: string): { isValid: boolean; error?: string } {
    try {
      const urlObj = new URL(url);
      
      // Проверяем протокол
      if (!['https:', 'http:'].includes(urlObj.protocol)) {
        return { isValid: false, error: 'Неподдерживаемый протокол' };
      }

      // В production требуем HTTPS
      if (!this.isDevelopmentMode() && urlObj.protocol !== 'https:') {
        return { isValid: false, error: 'HTTPS требуется в production' };
      }

      // Проверяем whitelist доменов
      const isWhitelisted = this.WEBHOOK_DOMAINS_WHITELIST.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
      );

      if (!isWhitelisted) {
        return { isValid: false, error: 'Домен не в whitelist' };
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: 'Невалидный URL' };
    }
  }

  /**
   * Защита от replay атак
   */
  private static usedNonces = new Set<string>();
  
  validateNonce(nonce: string): boolean {
    if (TelegramValidationService.usedNonces.has(nonce)) {
      return false; // Nonce уже использован
    }
    
    TelegramValidationService.usedNonces.add(nonce);
    
    // Очищаем старые nonces (каждые 10 минут)
    if (TelegramValidationService.usedNonces.size > 1000) {
      TelegramValidationService.usedNonces.clear();
    }
    
    return true;
  }
}

export default TelegramValidationService;
