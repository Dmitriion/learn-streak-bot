
import YOUCasaProvider from '../YOUCasaProvider';
import RobocasaProvider from '../RobocasaProvider';
import TelegramPaymentProvider from '../TelegramPaymentProvider';
import LoggingService from '../LoggingService';
import ErrorService from '../ErrorService';

export interface PaymentProviderConfig {
  youkassa?: {
    shopId: string;
    secretKey: string;
  };
  robocasa?: {
    merchantId: string;
    secretKey: string;
  };
  telegram?: {
    enabled: boolean;
  };
}

class PaymentProviderManager {
  private static instance: PaymentProviderManager;
  private providers: Map<string, any>;
  private logger: LoggingService;
  private errorService: ErrorService;

  constructor() {
    this.providers = new Map();
    this.logger = LoggingService.getInstance();
    this.errorService = ErrorService.getInstance();
    
    this.validateEnvironment();
    this.initializeProviders();
  }

  static getInstance(): PaymentProviderManager {
    if (!PaymentProviderManager.instance) {
      PaymentProviderManager.instance = new PaymentProviderManager();
    }
    return PaymentProviderManager.instance;
  }

  private validateEnvironment(): void {
    const requiredVars = [
      'VITE_YOUKASSA_SHOP_ID',
      'VITE_YOUKASSA_SECRET_KEY',
      'VITE_ROBOCASA_MERCHANT_ID', 
      'VITE_ROBOCASA_SECRET_KEY'
    ];

    const missingVars = requiredVars.filter(varName => 
      !import.meta.env[varName] || import.meta.env[varName].trim() === ''
    );

    if (missingVars.length > 0) {
      this.logger.warn('Отсутствуют environment variables для платежных провайдеров', { 
        missingVars 
      });
    }
  }

  private initializeProviders(): void {
    try {
      // YOUCasa Provider
      if (import.meta.env.VITE_YOUKASSA_SHOP_ID && import.meta.env.VITE_YOUKASSA_SECRET_KEY) {
        this.providers.set('youkassa', new YOUCasaProvider({
          shopId: import.meta.env.VITE_YOUKASSA_SHOP_ID,
          secretKey: import.meta.env.VITE_YOUKASSA_SECRET_KEY,
          testMode: import.meta.env.VITE_APP_ENV !== 'production'
        }));
        this.logger.info('YOUCasa provider инициализирован');
      } else {
        this.logger.warn('YOUCasa provider не инициализирован - отсутствуют credentials');
      }

      // Robocasa Provider  
      if (import.meta.env.VITE_ROBOCASA_MERCHANT_ID && import.meta.env.VITE_ROBOCASA_SECRET_KEY) {
        this.providers.set('robocasa', new RobocasaProvider({
          merchantId: import.meta.env.VITE_ROBOCASA_MERCHANT_ID,
          secretKey: import.meta.env.VITE_ROBOCASA_SECRET_KEY,
          testMode: import.meta.env.VITE_APP_ENV !== 'production'
        }));
        this.logger.info('Robocasa provider инициализирован');
      } else {
        this.logger.warn('Robocasa provider не инициализирован - отсутствуют credentials');
      }

      // Telegram Payment Provider - всегда доступен если есть N8N
      const n8nWebhookUrl = localStorage.getItem('n8n_webhook_url');
      if (n8nWebhookUrl) {
        this.providers.set('telegram', new TelegramPaymentProvider());
        this.logger.info('Telegram Payment provider инициализирован');
      } else {
        this.logger.warn('Telegram Payment provider не инициализирован - отсутствует N8N webhook URL');
      }

      if (this.providers.size === 0) {
        this.logger.error('Ни один платежный провайдер не инициализирован');
      }
    } catch (error) {
      this.errorService.handleError({
        category: 'payment',
        message: 'Ошибка инициализации платежных провайдеров',
        originalError: error as Error,
        recoverable: false
      });
    }
  }

  getProvider(providerId: string) {
    return this.providers.get(providerId);
  }

  getAllProviders(): Map<string, any> {
    return new Map(this.providers);
  }

  getProviderStatus(): { [key: string]: boolean } {
    const status: { [key: string]: boolean } = {};
    
    for (const [name] of this.providers.entries()) {
      status[name] = true;
    }
    
    return status;
  }

  hasProviders(): boolean {
    return this.providers.size > 0;
  }

  // Переинициализация провайдеров при изменении настроек
  reinitializeProviders(): void {
    this.providers.clear();
    this.initializeProviders();
  }
}

export default PaymentProviderManager;
