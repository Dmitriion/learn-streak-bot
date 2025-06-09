
import LoggingService from '../LoggingService';
import { isTelegramWebAppAvailable } from '../../utils/telegramTypeGuards';

class EnvironmentValidator {
  private static instance: EnvironmentValidator;
  private logger: LoggingService;

  constructor() {
    this.logger = LoggingService.getInstance();
  }

  static getInstance(): EnvironmentValidator {
    if (!EnvironmentValidator.instance) {
      EnvironmentValidator.instance = new EnvironmentValidator();
    }
    return EnvironmentValidator.instance;
  }

  isDevelopmentMode(): boolean {
    const appEnv = (globalThis as { __APP_ENV__?: string }).__APP_ENV__ || 'development';
    return appEnv === 'development' || 
           window.location.hostname === 'localhost' || 
           window.location.hostname.includes('lovableproject.com') ||
           window.location.hostname.includes('127.0.0.1');
  }

  isTelegramEnvironment(): boolean {
    return isTelegramWebAppAvailable();
  }

  getEnvironmentInfo() {
    return {
      isDevelopment: this.isDevelopmentMode(),
      isTelegramApp: this.isTelegramEnvironment(),
      webAppVersion: window.Telegram?.WebApp?.version || 'unknown',
      platform: window.Telegram?.WebApp?.platform || 'web'
    };
  }

  validateEnvironment(): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    
    if (!this.isTelegramEnvironment() && !this.isDevelopmentMode()) {
      warnings.push('Приложение не запущено в среде Telegram');
    }

    if (this.isDevelopmentMode()) {
      warnings.push('Приложение работает в режиме разработки');
    }

    return {
      isValid: warnings.length === 0 || this.isDevelopmentMode(),
      warnings
    };
  }
}

export default EnvironmentValidator;
