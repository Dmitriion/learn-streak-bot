
import { PaymentData, PaymentResponse } from '../schemas/validation';

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

  constructor(config: RobocasaConfig) {
    this.config = config;
    this.baseUrl = config.testMode 
      ? 'https://demo.robocasa.ru/api/v1' 
      : 'https://api.robocasa.ru/v1';
  }

  async createPayment(paymentData: PaymentData): Promise<PaymentResponse> {
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

      console.log('Robocasa payment request:', paymentRequest);

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
        throw new Error(`Robocasa API error: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        payment_id: result.payment_id,
        payment_url: result.payment_url,
        message: 'Платеж создан через Robocasa'
      };
    } catch (error) {
      console.error('Robocasa payment error:', error);
      return {
        success: false,
        error: 'Ошибка создания платежа через Robocasa'
      };
    }
  }

  async getPaymentStatus(paymentId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
          'X-Merchant-Id': this.config.merchantId
        }
      });

      if (!response.ok) {
        throw new Error(`Robocasa API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Robocasa get payment status error:', error);
      return null;
    }
  }
}

export default RobocasaProvider;
