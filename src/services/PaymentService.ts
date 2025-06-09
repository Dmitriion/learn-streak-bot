
import { SubscriptionPlan, PaymentData, PaymentResponse } from '../schemas/validation';
import PlansProvider from './payment/PlansProvider';
import PaymentValidator from './payment/PaymentValidator';
import PaymentProviderManager from './payment/PaymentProviderManager';
import PaymentStatusService from './payment/PaymentStatusService';
import PaymentHealthService, { ServiceHealthDetails } from './payment/PaymentHealthService';
import AutomationManager from './automation/AutomationManager';
import ErrorService from './ErrorService';
import LoggingService from './LoggingService';

class PaymentService {
  private static instance: PaymentService;
  private providerManager: PaymentProviderManager;
  private statusService: PaymentStatusService;
  private healthService: PaymentHealthService;
  private plansProvider: PlansProvider;
  private validator: PaymentValidator;
  private automationManager: AutomationManager;
  private errorService: ErrorService;
  private logger: LoggingService;

  constructor() {
    this.logger = LoggingService.getInstance();
    this.errorService = ErrorService.getInstance();
    
    this.providerManager = PaymentProviderManager.getInstance();
    this.statusService = PaymentStatusService.getInstance();
    this.healthService = PaymentHealthService.getInstance();
    this.plansProvider = PlansProvider.getInstance();
    this.validator = PaymentValidator.getInstance();
    this.automationManager = AutomationManager.getInstance();

    this.logger.info('PaymentService инициализирован', { 
      environment: import.meta.env.VITE_APP_ENV || import.meta.env.MODE,
      testMode: import.meta.env.VITE_APP_ENV !== 'production',
      providersCount: this.providerManager.getProviderStatus()
    });
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

      const provider = this.providerManager.getProvider(paymentData.provider);
      if (!provider) {
        this.logger.error('Провайдер не найден или не инициализирован', { 
          provider: paymentData.provider,
          availableProviders: Object.keys(this.providerManager.getProviderStatus())
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

  async getSubscriptionStatus(userId: string) {
    return this.statusService.getSubscriptionStatus(userId);
  }

  async cancelSubscription(userId: string, subscriptionId: string): Promise<boolean> {
    return this.statusService.cancelSubscription(userId, subscriptionId);
  }

  async checkPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    return this.statusService.checkPaymentStatus(paymentId);
  }

  // Диагностические методы
  getProviderStatus(): { [key: string]: boolean } {
    return this.healthService.getProviderStatus();
  }

  getServiceHealth(): ServiceHealthDetails {
    return this.healthService.getServiceHealth();
  }
}

export default PaymentService;
