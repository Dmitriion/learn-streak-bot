
import crypto from 'crypto';

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

  constructor() {
    // В production получаем из переменных окружения
    this.BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'development_token';
  }

  static getInstance(): TelegramValidationService {
    if (!TelegramValidationService.instance) {
      TelegramValidationService.instance = new TelegramValidationService();
    }
    return TelegramValidationService.instance;
  }

  /**
   * Полная валидация initData согласно документации Telegram
   * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
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

      // Удаляем hash из данных для проверки
      delete data.hash;

      // Полная HMAC валидация
      const isValidHMAC = this.validateHMAC(data, hash);
      if (!isValidHMAC) {
        return { isValid: false, error: 'Невалидная подпись HMAC' };
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
      console.error('Ошибка валидации initData:', error);
      return { isValid: false, error: 'Ошибка парсинга initData' };
    }
  }

  private validateHMAC(data: any, receivedHash: string): boolean {
    // В режиме разработки можем пропустить валидацию
    if (process.env.NODE_ENV === 'development' && !process.env.STRICT_VALIDATION) {
      console.warn('Режим разработки: пропуск валидации HMAC');
      return true;
    }

    try {
      // Сортируем ключи и создаем строку для проверки
      const dataCheckString = Object.keys(data)
        .sort()
        .map(key => {
          const value = typeof data[key] === 'object' 
            ? JSON.stringify(data[key]) 
            : data[key];
          return `${key}=${value}`;
        })
        .join('\n');

      // Создаем секретный ключ из bot token
      const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(this.BOT_TOKEN)
        .digest();

      // Вычисляем HMAC
      const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

      return calculatedHash === receivedHash;
    } catch (error) {
      console.error('Ошибка вычисления HMAC:', error);
      return false;
    }
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
      if (process.env.NODE_ENV === 'production' && urlObj.protocol !== 'https:') {
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
