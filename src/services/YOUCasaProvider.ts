
import { PaymentData, PaymentResponse } from '../schemas/validation';
import LoggingService from './LoggingService';
import ErrorService from './ErrorService';

export interface YOUCasaConfig {
  shopId: string;
  secretKey: string;
  testMode: boolean;
}

export interface YOUCasaPaymentRequest {
  amount: {
    value: string;
    currency: string;
  };
  confirmation: {
    type: 'redirect';
    return_url: string;
  };
  description: string;
  metadata: {
    user_id: string;
    plan_id: string;
  };
}

class YOUCasaProvider {
  private config: YOUCasaConfig;
  private baseUrl: string;
  private logger: LoggingService;
  private errorService: ErrorService;

  constructor(config: YOUCasaConfig) {
    this.config = config;
    this.baseUrl = config.testMode 
      ? 'https://api.yookassa.ru/v3' 
      : 'https://api.yookassa.ru/v3';
    this.logger = LoggingService.getInstance();
    this.errorService = ErrorService.getInstance();
  }

  async createPayment(paymentData: PaymentData): Promise<PaymentResponse> {
    this.logger.info('YOUCasa creating payment', { 
      userId: paymentData.user_id, 
      amount: paymentData.amount 
    });

    try {
      const paymentRequest: YOUCasaPaymentRequest = {
        amount: {
          value: paymentData.amount.toFixed(2),
          currency: paymentData.currency
        },
        confirmation: {
          type: 'redirect',
          return_url: paymentData.return_url || `${window.location.origin}/payment-success`
        },
        description: `Подписка на обучающую платформу - План ${paymentData.plan_id}`,
        metadata: {
          user_id: paymentData.user_id,
          plan_id: paymentData.plan_id
        }
      };

      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${this.config.shopId}:${this.config.secretKey}`)}`,
          'Content-Type': 'application/json',
          'Idempotence-Key': `${paymentData.user_id}-${Date.now()}`
        },
        body: JSON.stringify(paymentRequest)
      });

      if (!response.ok) {
        throw new Error(`YOUCasa API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      this.logger.info('YOUCasa payment created successfully', { 
        paymentId: result.id 
      });

      return {
        success: true,
        payment_id: result.id,
        payment_url: result.confirmation.confirmation_url,
        message: 'Платеж создан через YOUCasa'
      };
    } catch (error) {
      this.errorService.handlePaymentError(
        'Ошибка создания платежа YOUCasa',
        { paymentData, originalError: error }
      );
      
      return {
        success: false,
        error: 'Ошибка создания платежа через YOUCasa'
      };
    }
  }

  async checkPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    this.logger.info('YOUCasa checking payment status', { paymentId });

    try {
      const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
        headers: {
          'Authorization': `Basic ${btoa(`${this.config.shopId}:${this.config.secretKey}`)}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`YOUCasa API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      this.logger.info('YOUCasa payment status checked', { 
        paymentId: result.id,
        status: result.status 
      });

      // Убираю поле data из возвращаемого объекта, чтобы соответствовать типу PaymentResponse
      return {
        success: result.status === 'succeeded',
        payment_id: result.id,
        message: `Статус платежа: ${result.status}`
      };
    } catch (error) {
      this.errorService.handlePaymentError(
        'Ошибка проверки статуса YOUCasa',
        { paymentId, originalError: error }
      );
      
      return {
        success: false,
        error: 'Ошибка проверки статуса платежа через YOUCasa'
      };
    }
  }

  async getSubscriptionStatus(userId: string): Promise<any> {
    try {
      this.logger.info('Getting subscription status for user', { userId });
      
      // В реальной реализации здесь был бы запрос к API подписок YOUCasa
      // Пока возвращаем null, так как API подписок требует отдельной настройки
      return null;
    } catch (error) {
      this.errorService.handleError({
        category: 'payment',
        message: 'Ошибка получения статуса подписки YOUCasa',
        originalError: error as Error,
        context: { userId },
        recoverable: true
      });
      return null;
    }
  }

  async cancelSubscription(userId: string, subscriptionId: string): Promise<boolean> {
    try {
      this.logger.info('Canceling subscription', { userId, subscriptionId });
      
      // В реальной реализации здесь был бы запрос к API отмены подписки YOUCasa
      // Пока возвращаем true как успешную операцию
      return true;
    } catch (error) {
      this.errorService.handleError({
        category: 'payment',
        message: 'Ошибка отмены подписки YOUCasa',
        originalError: error as Error,
        context: { userId, subscriptionId },
        recoverable: true
      });
      return false;
    }
  }
}

export default YOUCasaProvider;
