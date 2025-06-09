
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

    if (import.meta.env.VITE_ENABLE_MOCK_MODE === 'true') {
      errors.push('Mock режим не должен быть включен в production');
    }

    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      errors.push('HTTPS обязателен в production');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
