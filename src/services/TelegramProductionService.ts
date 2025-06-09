import LoggingService from './LoggingService';
import TelegramValidationService from './TelegramValidationService';
import { 
  safeEnableClosingConfirmation, 
  isHeaderColorSupported,
  logWebAppCapabilities 
} from '../utils/telegram/webAppSupport';

class TelegramProductionService {
  private static instance: TelegramProductionService;
  private logger: LoggingService;
  private validationService: TelegramValidationService;

  constructor() {
    this.logger = LoggingService.getInstance();
    this.validationService = TelegramValidationService.getInstance();
  }

  static getInstance(): TelegramProductionService {
    if (!TelegramProductionService.instance) {
      TelegramProductionService.instance = new TelegramProductionService();
    }
    return TelegramProductionService.instance;
  }

  initializeProduction() {
    // Регистрируем service worker для PWA
    this.registerServiceWorker();
    
    // Настраиваем CSP заголовки
    this.setupCSP();
    
    // Инициализируем Telegram WebApp в production режиме
    this.initializeTelegramWebApp();
    
    // Настраиваем error reporting
    this.setupErrorReporting();
  }

  private registerServiceWorker() {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            this.logger.info('SW registered: ', { registration });
          })
          .catch(registrationError => {
            this.logger.error('SW registration failed: ', { registrationError });
          });
      });
    }
  }

  private setupCSP() {
    const metaCSP = document.createElement('meta');
    metaCSP.httpEquiv = 'Content-Security-Policy';
    metaCSP.content = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' https://telegram.org https://*.telegram.org;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      connect-src 'self' https://api.telegram.org https://*.telegram.org;
      frame-ancestors 'none';
    `.replace(/\s+/g, ' ').trim();
    
    document.head.appendChild(metaCSP);
  }

  private initializeTelegramWebApp() {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      
      // Логируем возможности WebApp API
      logWebAppCapabilities();
      
      // Валидируем initData в production
      if (import.meta.env.PROD) {
        const initDataValidation = this.validationService.validateInitData(
          webApp.initData || ''
        );
        
        if (!initDataValidation.isValid) {
          this.logger.error('Invalid initData in production', { 
            error: initDataValidation.error 
          });
        }
      }
      
      // Настраиваем WebApp для production
      webApp.ready();
      webApp.expand();
      
      // Безопасно включаем подтверждение закрытия
      safeEnableClosingConfirmation();
      
      // Безопасно устанавливаем заголовок если поддерживается
      if (isHeaderColorSupported()) {
        try {
          webApp.setHeaderColor!('#6366f1');
          this.logger.debug('Цвет заголовка установлен');
        } catch (error) {
          this.logger.debug('Ошибка установки цвета заголовка', { error });
        }
      }
      
      this.logger.info('Telegram WebApp initialized for production');
    }
  }

  private setupErrorReporting() {
    window.addEventListener('error', (event) => {
      this.logger.error('Global error caught', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
      
      if (window.Telegram?.WebApp && event.error) {
        try {
          window.Telegram.WebApp.showAlert(
            'Произошла ошибка. Приложение будет перезагружено.'
          );
        } catch (e) {
          console.error('Failed to show Telegram alert:', e);
        }
      }
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.logger.error('Unhandled promise rejection', {
        reason: event.reason
      });
      
      event.preventDefault();
    });
  }

  getProductionConfig() {
    return {
      isTelegramEnvironment: !!window.Telegram?.WebApp,
      webAppVersion: window.Telegram?.WebApp?.version || 'unknown',
      platform: window.Telegram?.WebApp?.platform || 'web',
      isDevelopment: import.meta.env.DEV,
      isProduction: import.meta.env.PROD
    };
  }

  validateEnvironment(): boolean {
    const config = this.getProductionConfig();
    
    if (config.isProduction && !config.isTelegramEnvironment) {
      this.logger.warn('Production build running outside Telegram environment');
      return false;
    }
    
    return true;
  }
}

export default TelegramProductionService;
