
import { PaymentData, PaymentResponse } from '../schemas/validation';
import LoggingService from './LoggingService';
import ErrorService from './ErrorService';

export interface RobocasaConfig {
  merchantId: string;
  secretKey: string;
  testMode: boolean;
}

export interface RobocasaPaymentRequest {
  amount: number;
  currency: string;
  order_id: string;
  description: string;
  success_url: string;
  fail_url: string;
  customer: {
    user_id: string;
  };
  metadata: {
    plan_id: string;
  };
}

class RobocasaProvider {
  private config: RobocasaConfig;
  private baseUrl: string;
  private logger: LoggingService;
  private errorService: ErrorService;

  constructor(config: RobocasaConfig) {
    this.config = config;
    this.baseUrl = config.testMode 
      ? 'https://demo.robocasa.ru/api/v1' 
      : 'https://api.robocasa.ru/v1';
    this.logger = LoggingService.getInstance();
    this.errorService = ErrorService.getInstance();
  }

  async createPayment(paymentData: PaymentData): Promise<PaymentResponse> {
    this.logger.info('Robocasa creating payment', { 
      userId: paymentData.user_id, 
      amount: paymentData.amount 
    });

    try {
      const orderId = `order_${paymentData.user_id}_${Date.now()}`;
      
      const paymentRequest: RobocasaPaymentRequest = {
        amount: paymentData.amount,
        currency: paymentData.currency,
        order_id: orderId,
        description: `Подписка на обучающую платформу - План ${paymentData.plan_id}`,
        success_url: paymentData.return_url || window.location.origin,
        fail_url: paymentData.return_url || window.location.origin,
        customer: {
          user_id: paymentData.user_id
        },
        metadata: {
          plan_id: paymentData.plan_id
        }
      };

      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
          'Content-Type': 'application/json',
          'X-Merchant-Id': this.config.merchantId
        },
        body: JSON.stringify(paymentRequest)
      });

      if (!response.ok) {
        throw new Error(`Robocasa API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      this.logger.info('Robocasa payment created successfully', { 
        paymentId: result.payment_id 
      });
      
      return {
        success: true,
        payment_id: result.payment_id,
        payment_url: result.payment_url,
        message: 'Платеж создан через Robocasa'
      };
    } catch (error) {
      this.errorService.handlePaymentError(
        'Ошибка создания платежа Robocasa',
        { paymentData, originalError: error }
      );
      
      return {
        success: false,
        error: 'Ошибка создания платежа через Robocasa'
      };
    }
  }

  async checkPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    this.logger.info('Robocasa checking payment status', { paymentId });

    try {
      const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
          'X-Merchant-Id': this.config.merchantId
        }
      });

      if (!response.ok) {
        throw new Error(`Robocasa API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      this.logger.info('Robocasa payment status checked', { 
        paymentId: result.payment_id,
        status: result.status 
      });

      return {
        success: result.status === 'succeeded',
        payment_id: result.payment_id,
        message: `Статус платежа: ${result.status}`
      };
    } catch (error) {
      this.errorService.handlePaymentError(
        'Ошибка проверки статуса Robocasa',
        { paymentId, originalError: error }
      );
      
      return {
        success: false,
        error: 'Ошибка проверки статуса платежа через Robocasa'
      };
    }
  }

  async getSubscriptionStatus(userId: string): Promise<any> {
    try {
      this.logger.info('Getting subscription status for user', { userId });
      
      // В реальной реализации здесь был бы запрос к API подписок Robocasa
      // Пока возвращаем null, так как API подписок требует отдельной настройки
      return null;
    } catch (error) {
      this.errorService.handleError({
        category: 'payment',
        message: 'Ошибка получения статуса подписки Robocasa',
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
      
      // В реальной реализации здесь был бы запрос к API отмены подписки Robocasa
      // Пока возвращаем true как успешную операцию
      return true;
    } catch (error) {
      this.errorService.handleError({
        category: 'payment',
        message: 'Ошибка отмены подписки Robocasa',
        originalError: error as Error,
        context: { userId, subscriptionId },
        recoverable: true
      });
      return false;
    }
  }
}

export default RobocasaProvider;
