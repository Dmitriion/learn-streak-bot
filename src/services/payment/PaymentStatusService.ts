
import { PaymentResponse } from '../../schemas/validation';
import LoggingService from '../LoggingService';
import ErrorService from '../ErrorService';
import PaymentProviderManager from './PaymentProviderManager';

class PaymentStatusService {
  private static instance: PaymentStatusService;
  private logger: LoggingService;
  private errorService: ErrorService;
  private providerManager: PaymentProviderManager;

  constructor() {
    this.logger = LoggingService.getInstance();
    this.errorService = ErrorService.getInstance();
    this.providerManager = PaymentProviderManager.getInstance();
  }

  static getInstance(): PaymentStatusService {
    if (!PaymentStatusService.instance) {
      PaymentStatusService.instance = new PaymentStatusService();
    }
    return PaymentStatusService.instance;
  }

  async checkPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    this.logger.info('Проверка статуса платежа', { paymentId });

    try {
      const providers = this.providerManager.getAllProviders();
      
      // Проверяем статус у всех доступных провайдеров
      for (const [name, provider] of providers.entries()) {
        try {
          this.logger.info(`Проверка статуса у провайдера ${name}`, { paymentId });
          const result = await provider.checkPaymentStatus(paymentId);
          
          if (result.success) {
            this.logger.info('Статус платежа получен', { 
              paymentId, 
              provider: name,
              success: result.success
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

  async getSubscriptionStatus(userId: string) {
    try {
      const provider = this.providerManager.getProvider('youkassa');
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
      const provider = this.providerManager.getProvider('youkassa');
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
}

export default PaymentStatusService;
