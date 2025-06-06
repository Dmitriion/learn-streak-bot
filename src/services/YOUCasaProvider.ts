
import { PaymentData, PaymentResponse } from './PaymentService';

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

  constructor(config: YOUCasaConfig) {
    this.config = config;
    this.baseUrl = config.testMode 
      ? 'https://api.yookassa.ru/v3' 
      : 'https://api.yookassa.ru/v3';
  }

  async createPayment(paymentData: PaymentData): Promise<PaymentResponse> {
    try {
      const paymentRequest: YOUCasaPaymentRequest = {
        amount: {
          value: paymentData.amount.toFixed(2),
          currency: paymentData.currency
        },
        confirmation: {
          type: 'redirect',
          return_url: paymentData.return_url || window.location.origin
        },
        description: `Подписка на обучающую платформу`,
        metadata: {
          user_id: paymentData.user_id,
          plan_id: paymentData.plan_id
        }
      };

      console.log('YOUCasa payment request:', paymentRequest);

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
        throw new Error(`YOUCasa API error: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        payment_id: result.id,
        payment_url: result.confirmation.confirmation_url,
        message: 'Платеж создан через YOUCasa'
      };
    } catch (error) {
      console.error('YOUCasa payment error:', error);
      return {
        success: false,
        error: 'Ошибка создания платежа через YOUCasa'
      };
    }
  }

  async getPaymentStatus(paymentId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
        headers: {
          'Authorization': `Basic ${btoa(`${this.config.shopId}:${this.config.secretKey}`)}`
        }
      });

      if (!response.ok) {
        throw new Error(`YOUCasa API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('YOUCasa get payment status error:', error);
      return null;
    }
  }
}

export default YOUCasaProvider;
