
export interface PaymentProvider {
  id: 'youkassa' | 'robocasa';
  name: string;
  available: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: 'RUB' | 'USD' | 'EUR';
  duration: number; // days
  features: string[];
  popular?: boolean;
}

export interface PaymentData {
  user_id: string;
  plan_id: string;
  amount: number;
  currency: string;
  provider: PaymentProvider['id'];
  return_url?: string;
}

export interface PaymentResponse {
  success: boolean;
  payment_id?: string;
  payment_url?: string;
  message?: string;
  error?: string;
}

export interface SubscriptionStatus {
  is_active: boolean;
  plan_id: string;
  expires_at: string;
  provider: PaymentProvider['id'];
  auto_renew: boolean;
}

class PaymentService {
  private static instance: PaymentService;
  private baseWebhookUrl = '';

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  setWebhookUrl(url: string) {
    this.baseWebhookUrl = url;
  }

  getAvailablePlans(): SubscriptionPlan[] {
    return [
      {
        id: 'basic',
        name: 'Базовый доступ',
        price: 0,
        currency: 'RUB',
        duration: 30,
        features: ['Доступ к первым 3 урокам', 'Базовая аналитика']
      },
      {
        id: 'premium',
        name: 'Премиум доступ',
        price: 1990,
        currency: 'RUB',
        duration: 30,
        features: ['Все уроки курса', 'Детальная аналитика', 'Сертификат'],
        popular: true
      },
      {
        id: 'vip',
        name: 'VIP доступ',
        price: 4990,
        currency: 'RUB',
        duration: 30,
        features: ['Все уроки курса', 'Персональные консультации', 'Приоритетная поддержка', 'Дополнительные материалы']
      }
    ];
  }

  async createPayment(paymentData: PaymentData): Promise<PaymentResponse> {
    try {
      console.log('Создание платежа:', paymentData);
      
      const response = await fetch(`${this.baseWebhookUrl}/webhook/payment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...paymentData,
          timestamp: new Date().toISOString(),
          action: 'create_payment'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        payment_id: result.payment_id,
        payment_url: result.payment_url,
        message: 'Платеж создан успешно'
      };
    } catch (error) {
      console.error('Ошибка создания платежа:', error);
      return {
        success: false,
        error: 'Ошибка при создании платежа'
      };
    }
  }

  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus | null> {
    try {
      const response = await fetch(`${this.baseWebhookUrl}/webhook/subscription/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          action: 'get_subscription_status'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.subscription_status;
    } catch (error) {
      console.error('Ошибка получения статуса подписки:', error);
      return null;
    }
  }

  async confirmPayment(paymentId: string, userId: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseWebhookUrl}/webhook/payment/confirm`, {
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        message: result.message || 'Платеж подтвержден'
      };
    } catch (error) {
      console.error('Ошибка подтверждения платежа:', error);
      return {
        success: false,
        error: 'Ошибка при подтверждении платежа'
      };
    }
  }
}

export default PaymentService;
