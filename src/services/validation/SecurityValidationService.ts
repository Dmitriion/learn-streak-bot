
import LoggingService from '../LoggingService';
import { ValidationResult } from './types';

class SecurityValidationService {
  private static instance: SecurityValidationService;
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
  }

  static getInstance(): SecurityValidationService {
    if (!SecurityValidationService.instance) {
      SecurityValidationService.instance = new SecurityValidationService();
    }
    return SecurityValidationService.instance;
  }

  private isDevelopmentMode(): boolean {
    return window.location.hostname === 'localhost' || 
           window.location.hostname.includes('lovableproject.com') ||
           window.location.hostname.includes('127.0.0.1');
  }

  /**
   * Проверка на подозрительные значения пользователя
   */
  performSecurityChecks(data: any): ValidationResult {
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

  /**
   * Проверка содержимого на подозрительные паттерны
   */
  containsSuspiciousContent(text: string): boolean {
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
  validateWebhookUrl(url: string): ValidationResult {
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
    if (SecurityValidationService.usedNonces.has(nonce)) {
      return false; // Nonce уже использован
    }
    
    SecurityValidationService.usedNonces.add(nonce);
    
    // Очищаем старые nonces (каждые 10 минут)
    if (SecurityValidationService.usedNonces.size > 1000) {
      SecurityValidationService.usedNonces.clear();
    }
    
    return true;
  }
}

export default SecurityValidationService;
