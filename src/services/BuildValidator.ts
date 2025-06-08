
import LoggingService from './LoggingService';

class BuildValidator {
  private static instance: BuildValidator;
  private logger: LoggingService;

  constructor() {
    this.logger = LoggingService.getInstance();
  }

  static getInstance(): BuildValidator {
    if (!BuildValidator.instance) {
      BuildValidator.instance = new BuildValidator();
    }
    return BuildValidator.instance;
  }

  validateProductionBuild(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Проверяем обязательные environment variables для production
    if (import.meta.env.PROD) {
      if (!import.meta.env.VITE_N8N_WEBHOOK_URL) {
        this.logger.warn('N8N Webhook URL не настроен для production');
      }
      
      if (import.meta.env.VITE_ENABLE_MOCK_MODE === 'true') {
        errors.push('Mock режим включен в production сборке');
      }
    }

    // Проверяем Telegram WebApp availability
    if (typeof window !== 'undefined') {
      if (!window.Telegram?.WebApp) {
        this.logger.warn('Telegram WebApp недоступен - приложение запущено вне Telegram');
      }
    }

    // Проверяем HTTPS для production
    if (import.meta.env.PROD && typeof window !== 'undefined') {
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        errors.push('Production сборка должна использовать HTTPS');
      }
    }

    const isValid = errors.length === 0;
    
    if (!isValid) {
      this.logger.error('Build validation failed', { errors });
    } else {
      this.logger.info('Build validation passed');
    }

    return { isValid, errors };
  }

  getProductionReadinessStatus(): {
    score: number;
    checks: Array<{ name: string; passed: boolean; critical: boolean }>;
  } {
    const checks = [
      {
        name: 'Telegram WebApp API доступен',
        passed: typeof window !== 'undefined' && !!window.Telegram?.WebApp,
        critical: true
      },
      {
        name: 'HTTPS протокол',
        passed: typeof window !== 'undefined' && 
               (window.location.protocol === 'https:' || window.location.hostname === 'localhost'),
        critical: true
      },
      {
        name: 'N8N Webhook настроен',
        passed: !!import.meta.env.VITE_N8N_WEBHOOK_URL,
        critical: false
      },
      {
        name: 'Mock режим отключен',
        passed: import.meta.env.VITE_ENABLE_MOCK_MODE !== 'true',
        critical: import.meta.env.PROD
      },
      {
        name: 'Service Worker поддерживается',
        passed: typeof window !== 'undefined' && 'serviceWorker' in navigator,
        critical: false
      }
    ];

    const passedChecks = checks.filter(check => check.passed).length;
    const score = Math.round((passedChecks / checks.length) * 100);

    return { score, checks };
  }
}

export default BuildValidator;
