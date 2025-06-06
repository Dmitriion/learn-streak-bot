
import ErrorService from './ErrorService';
import LoggingService from './LoggingService';
import PaymentValidator from './payment/PaymentValidator';
import PlansProvider from './payment/PlansProvider';
import { PaymentProvider } from './payment/PaymentProvider';
import { 
  type PaymentData,
  type PaymentResponse,
  type SubscriptionStatus,
  type SubscriptionPlan
} from '../schemas/validation';

class PaymentService {
  private static instance: PaymentService;
  private baseWebhookUrl = '';
  private errorService: ErrorService;
  private logger: LoggingService;
  private validator: PaymentValidator;
  private plansProvider: PlansProvider;

  constructor() {
    this.errorService = ErrorService.getInstance();
    this.logger = LoggingService.getInstance();
    this.validator = new PaymentValidator();
    this.plansProvider = new PlansProvider();
  }

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  setWebhookUrl(url: string) {
    if (this.validator.validateWebhookUrl(url)) {
      this.baseWebhookUrl = url;
      const parsedUrl = new URL(url);
      this.logger.info('Webhook URL установлен', { url: parsedUrl.origin });
    }
  }

  getAvailablePlans(): SubscriptionPlan[] {
    return this.plansProvider.getAvailablePlans();
  }

  async createPayment(paymentData: PaymentData): Promise<PaymentResponse> {
    this.logger.info('Создание платежа', { 
      userId: paymentData.user_id,
      planId: paymentData.plan_id,
      amount: paymentData.amount 
    });
    
    try {
      // Валидация входных данных
      const validation = this.validator.validatePaymentData(paymentData);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Проверка webhook URL
      if (!this.baseWebhookUrl) {
        this.errorService.handleValidationError('Webhook URL не установлен');
        return {
          success: false,
          error: 'Сервис платежей временно недоступен'
        };
      }

      const requestPayload = {
        ...paymentData,
        timestamp: new Date().toISOString(),
        action: 'create_payment',
        client_ip: this.getClientIP(),
        user_agent: navigator.userAgent
      };

      const response = await this.errorService.withRetry(
        async () => {
          const res = await fetch(`${this.baseWebhookUrl}/webhook/payment/create`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify(requestPayload),
          });

          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }

          return res.json();
        },
        3,
        1000,
        'payment'
      );

      // Валидация ответа
      if (response.payment_url) {
        const urlValidation = this.validator.validatePaymentUrl(response.payment_url);
        if (!urlValidation.isValid) {
          this.errorService.handlePaymentError(
            `Небезопасная платежная ссылка: ${urlValidation.error}`,
            { paymentId: response.payment_id }
          );
          
          return {
            success: false,
            error: 'Ошибка безопасности платежной ссылки'
          };
        }
      }

      this.logger.info('Платеж успешно создан', { 
        paymentId: response.payment_id,
        userId: paymentData.user_id 
      });

      return {
        success: true,
        payment_id: response.payment_id,
        payment_url: response.payment_url,
        message: 'Платеж создан успешно'
      };

    } catch (error) {
      const appError = this.errorService.handlePaymentError(
        'Ошибка при создании платежа',
        { paymentData: { ...paymentData, user_id: '[REDACTED]' } }
      );

      return {
        success: false,
        error: 'Ошибка при создании платежа'
      };
    }
  }

  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus | null> {
    this.logger.debug('Получение статуса подписки', { userId });
    
    try {
      if (!this.baseWebhookUrl) {
        this.errorService.handleValidationError('Webhook URL не установлен');
        return null;
      }

      const response = await this.errorService.withRetry(
        async () => {
          const res = await fetch(`${this.baseWebhookUrl}/webhook/subscription/status`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: userId,
              action: 'get_subscription_status'
            }),
          });

          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }

          return res.json();
        },
        2,
        1000,
        'network'
      );

      // Валидация ответа
      if (response.subscription_status) {
        const validation = this.validator.validateSubscriptionStatus(response.subscription_status);
        if (!validation.isValid) {
          return null;
        }
        return validation.data;
      }

      this.logger.debug('Статус подписки получен', { 
        userId, 
        isActive: response.subscription_status?.is_active 
      });

      return response.subscription_status;

    } catch (error) {
      this.errorService.handleNetworkError(
        error as Error,
        { operation: 'getSubscriptionStatus', userId }
      );
      return null;
    }
  }

  async confirmPayment(paymentId: string, userId: string): Promise<PaymentResponse> {
    this.logger.info('Подтверждение платежа', { paymentId, userId });
    
    try {
      if (!this.baseWebhookUrl) {
        return {
          success: false,
          error: 'Сервис платежей временно недоступен'
        };
      }

      const response = await this.errorService.withRetry(
        async () => {
          const res = await fetch(`${this.baseWebhookUrl}/webhook/payment/confirm`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              payment_id: paymentId,
              user_id: userId,
              timestamp: new Date().toISOString(),
              action: 'confirm_payment'
            }),
          });

          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }

          return res.json();
        },
        3,
        1000,
        'payment'
      );

      this.logger.info('Платеж подтвержден', { paymentId, userId });

      return {
        success: true,
        message: response.message || 'Платеж подтвержден'
      };

    } catch (error) {
      const appError = this.errorService.handlePaymentError(
        'Ошибка подтверждения платежа',
        { paymentId, userId }
      );

      return {
        success: false,
        error: 'Ошибка при подтверждении платежа'
      };
    }
  }

  private getClientIP(): string {
    // В реальном приложении это может быть получено с сервера
    return 'unknown';
  }
}

export default PaymentService;
