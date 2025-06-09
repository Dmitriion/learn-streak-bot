
import { EnvironmentStrategy, EnvironmentMode, ConfigValidationResult } from './types';
import LoggingService from '../LoggingService';

export class DevelopmentStrategy implements EnvironmentStrategy {
  private logger: LoggingService;

  constructor() {
    this.logger = LoggingService.getInstance();
  }

  getMode(): EnvironmentMode {
    return 'development';
  }

  shouldUseMockData(): boolean {
    return import.meta.env.VITE_ENABLE_MOCK_MODE !== 'false';
  }

  shouldEnableFallbacks(): boolean {
    return true;
  }

  getLogLevel(): 'debug' | 'info' | 'warn' | 'error' {
    return 'debug';
  }

  validateConfiguration(): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // В development режиме предупреждаем о недостающих настройках
    if (!import.meta.env.VITE_N8N_WEBHOOK_URL) {
      warnings.push('N8N Webhook URL не настроен - будет использоваться Mock режим');
    }

    if (!import.meta.env.VITE_TELEGRAM_BOT_TOKEN) {
      warnings.push('Telegram Bot Token не настроен');
    }

    if (!import.meta.env.VITE_ADMIN_USER_IDS) {
      warnings.push('Admin User IDs не настроены - админский доступ доступен всем в dev режиме');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export class ProductionStrategy implements EnvironmentStrategy {
  private logger: LoggingService;

  constructor() {
    this.logger = LoggingService.getInstance();
  }

  getMode(): EnvironmentMode {
    return 'production';
  }

  shouldUseMockData(): boolean {
    return false;
  }

  shouldEnableFallbacks(): boolean {
    return true; // В production fallback'ы критически важны
  }

  getLogLevel(): 'debug' | 'info' | 'warn' | 'error' {
    return 'info';
  }

  validateConfiguration(): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // В production все настройки обязательны
    if (!import.meta.env.VITE_N8N_WEBHOOK_URL) {
      errors.push('N8N Webhook URL обязателен в production');
    }

    if (!import.meta.env.VITE_ADMIN_USER_IDS) {
      errors.push('Admin User IDs обязательны в production для безопасности');
    }

    if (import.meta.env.VITE_ENABLE_MOCK_MODE === 'true') {
      errors.push('Mock режим не должен быть включен в production');
    }

    if (typeof window !== 'undefined') {
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        errors.push('HTTPS обязателен в production');
      }
    }

    // Проверяем правильность формата Admin User IDs
    const adminIds = import.meta.env.VITE_ADMIN_USER_IDS;
    if (adminIds) {
      const parsedIds = adminIds.split(',').map(id => parseInt(id.trim()));
      const invalidIds = parsedIds.filter(id => isNaN(id));
      if (invalidIds.length > 0) {
        errors.push('Некорректный формат Admin User IDs - должны быть числа через запятую');
      }
    }

    // Проверяем URL формат
    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
    if (webhookUrl && !webhookUrl.startsWith('https://')) {
      warnings.push('Webhook URL должен использовать HTTPS в production');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
