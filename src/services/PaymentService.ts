
import { SubscriptionPlan, PaymentData, PaymentResponse, SubscriptionStatus } from '../schemas/validation';
import YOUCasaProvider from './YOUCasaProvider';
import RobocasaProvider from './RobocasaProvider';
import PlansProvider from './payment/PlansProvider';
import PaymentValidator from './payment/PaymentValidator';
import AutomationManager from './automation/AutomationManager';
import ErrorService from './ErrorService';
import LoggingService from './LoggingService';

class PaymentService {
  private static instance: PaymentService;
  private providers: Map<string, any>;
  private plansProvider: PlansProvider;
  private validator: PaymentValidator;
  private automationManager: AutomationManager;
  private errorService: ErrorService;
  private logger: LoggingService;

  constructor() {
    this.providers = new Map();
    this.logger = LoggingService.getInstance();
    this.errorService = ErrorService.getInstance();
    
    // Валидируем environment variables
    this.validateEnvironment();
    
    // Инициализируем провайдеры с проверкой наличия конфигурации
    this.initializeProviders();
    
    this.plansProvider = PlansProvider.getInstance();
    this.validator = PaymentValidator.getInstance();
    this.automationManager = AutomationManager.getInstance();

    this.logger.info('PaymentService инициализирован', { 
      environment: import.meta.env.VITE_APP_ENV || import.meta.env.MODE,
      testMode: import.meta.env.VITE_APP_ENV !== 'production',
      providersCount: this.providers.size
    });
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

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  getAvailablePlans(): SubscriptionPlan[] {
    try {
      return this.plansProvider.getAvailablePlans();
    } catch (error) {
      this.errorService.handleError({
        category: 'payment',
        message: 'Ошибка получения планов',
        originalError: error as Error,
        recoverable: true
      });
      return [];
    }
  }

  validatePaymentData(paymentData: PaymentData): { isValid: boolean; error?: string } {
    try {
      return this.validator.validatePaymentData(paymentData);
    } catch (error) {
      this.errorService.handleError({
        category: 'validation',
        message: 'Ошибка валидации данных платежа',
        originalError: error as Error,
        context: { paymentData },
        recoverable: true
      });
      return { isValid: false, error: 'Ошибка валидации' };
    }
  }

  async createPayment(paymentData: PaymentData): Promise<PaymentResponse> {
    this.logger.info('Создание платежа', { 
      userId: paymentData.user_id, 
      planId: paymentData.plan_id,
      amount: paymentData.amount,
      provider: paymentData.provider
    });

    try {
      const validation = this.validator.validatePaymentData(paymentData);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error || 'Невалидные данные платежа'
        };
      }

      const provider = this.providers.get(paymentData.provider);
      if (!provider) {
        this.logger.error('Провайдер не найден или не инициализирован', { 
          provider: paymentData.provider,
          availableProviders: Array.from(this.providers.keys())
        });
        
        return {
          success: false,
          error: `Провайдер ${paymentData.provider} недоступен`
        };
      }

      const result = await provider.createPayment(paymentData);
      
      if (result.success) {
        this.logger.info('Платеж успешно создан', { 
          userId: paymentData.user_id,
          paymentId: result.payment_id,
          provider: paymentData.provider
        });
        
        // Триггер автоматизации при успешной оплате
        try {
          await this.automationManager.onPaymentSuccess(
            paymentData.user_id,
            paymentData.plan_id,
            paymentData.amount
          );
        } catch (automationError) {
          this.logger.warn('Ошибка триггера автоматизации при создании платежа', { 
            automationError 
          });
          // Не прерываем процесс создания платежа из-за ошибки автоматизации
        }
      }

      return result;
    } catch (error) {
      this.errorService.handlePaymentError(
        'Ошибка создания платежа',
        { paymentData, originalError: error }
      );
      
      return {
        success: false,
        error: 'Ошибка при создании платежа'
      };
    }
  }

  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus | null> {
    try {
      const provider = this.providers.get('youkassa');
      if (!provider) {
        throw new Error('Провайдер не найден');
      }
      
      return await provider.getSubscriptionStatus(userId);
    } catch (error) {
      this.errorService.handleError({
        category: 'payment',
        message: 'Ошибка получения статуса подписки',
        originalError: error as Error,
        context: { userId },
        recoverable: true
      });
      
      return null;
    }
  }

  async cancelSubscription(userId: string, subscriptionId: string): Promise<boolean> {
    try {
      const provider = this.providers.get('youkassa');
      if (!provider) {
        throw new Error('Провайдер не найден');
      }
      
      return await provider.cancelSubscription(userId, subscriptionId);
    } catch (error) {
      this.errorService.handleError({
        category: 'payment',
        message: 'Ошибка отмены подписки',
        originalError: error as Error,
        context: { userId, subscriptionId },
        recoverable: true
      });
      
      return false;
    }
  }

  async checkPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    this.logger.info('Проверка статуса платежа', { paymentId });

    try {
      // Проверяем статус у всех доступных провайдеров
      for (const [name, provider] of this.providers.entries()) {
        try {
          this.logger.info(`Проверка статуса у провайдера ${name}`, { paymentId });
          const result = await provider.checkPaymentStatus(paymentId);
          
          if (result.success) {
            this.logger.info('Статус платежа получен', { 
              paymentId, 
              provider: name,
              status: result.data?.status
            });
            return result;
          }
        } catch (providerError) {
          this.logger.warn(`Ошибка проверки статуса у провайдера ${name}`, { 
            paymentId, 
            provider: name,
            error: providerError 
          });
        }
      }
      
      return {
        success: false,
        error: 'Платеж не найден ни у одного провайдера'
      };
    } catch (error) {
      this.errorService.handleError({
        category: 'payment',
        message: 'Ошибка проверки статуса платежа',
        originalError: error as Error,
        context: { paymentId },
        recoverable: true
      });
      
      return {
        success: false,
        error: 'Ошибка проверки статуса платежа'
      };
    }
  }

  // Диагностические методы
  getProviderStatus(): { [key: string]: boolean } {
    const status: { [key: string]: boolean } = {};
    
    for (const [name] of this.providers.entries()) {
      status[name] = true; // Если провайдер в Map, значит он инициализирован
    }
    
    return status;
  }

  getServiceHealth(): { healthy: boolean; details: any } {
    const providerStatus = this.getProviderStatus();
    const availableProviders = Object.keys(providerStatus).length;
    
    return {
      healthy: availableProviders > 0,
      details: {
        availableProviders,
        providerStatus,
        plansCount: this.getAvailablePlans().length,
        environment: import.meta.env.VITE_APP_ENV || import.meta.env.MODE
      }
    };
  }
}

export default PaymentService;
