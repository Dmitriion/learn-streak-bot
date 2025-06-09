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
    
    // Инициализируем провайдеры с правильными environment variables
    this.providers.set('youkassa', new YOUCasaProvider({
      shopId: import.meta.env.VITE_YOUKASSA_SHOP_ID || 'test_shop_id',
      secretKey: import.meta.env.VITE_YOUKASSA_SECRET_KEY || 'test_secret_key',
      testMode: import.meta.env.VITE_APP_ENV !== 'production'
    }));
    
    this.providers.set('robocasa', new RobocasaProvider({
      merchantId: import.meta.env.VITE_ROBOCASA_MERCHANT_ID || 'test_merchant_id',
      secretKey: import.meta.env.VITE_ROBOCASA_SECRET_KEY || 'test_secret_key',
      testMode: import.meta.env.VITE_APP_ENV !== 'production'
    }));
    
    this.plansProvider = new PlansProvider();
    this.validator = new PaymentValidator();
    this.automationManager = AutomationManager.getInstance();
    this.errorService = ErrorService.getInstance();
    this.logger = LoggingService.getInstance();

    this.logger.info('PaymentService инициализирован', { 
      environment: import.meta.env.VITE_APP_ENV,
      testMode: import.meta.env.VITE_APP_ENV !== 'production'
    });
  }

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  getAvailablePlans(): SubscriptionPlan[] {
    return this.plansProvider.getAvailablePlans();
  }

  validatePaymentData(paymentData: PaymentData): { isValid: boolean; error?: string } {
    return this.validator.validatePaymentData(paymentData);
  }

  async createPayment(paymentData: PaymentData): Promise<PaymentResponse> {
    this.logger.info('Создание платежа', { 
      userId: paymentData.user_id, 
      planId: paymentData.plan_id,
      amount: paymentData.amount 
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
        throw new Error(`Провайдер ${paymentData.provider} не найден`);
      }

      const result = await provider.createPayment(paymentData);
      
      if (result.success) {
        this.logger.info('Платеж успешно создан', { 
          userId: paymentData.user_id,
          paymentId: result.payment_id 
        });
        
        // Триггер автоматизации при успешной оплате
        await this.automationManager.onPaymentSuccess(
          paymentData.user_id,
          paymentData.plan_id,
          paymentData.amount
        );
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
    try {
      // Проверяем статус у всех провайдеров
      for (const [name, provider] of this.providers.entries()) {
        try {
          const result = await provider.checkPaymentStatus(paymentId);
          if (result.success) {
            return result;
          }
        } catch (e) {
          this.logger.warn(`Ошибка проверки статуса у провайдера ${name}`, { paymentId, error: e });
        }
      }
      
      return {
        success: false,
        error: 'Платеж не найден'
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
}

export default PaymentService;
