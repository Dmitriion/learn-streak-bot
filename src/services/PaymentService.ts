
import ErrorService from './ErrorService';
import LoggingService from './LoggingService';
import { 
  validatePaymentData, 
  validateSubscriptionStatus,
  type PaymentData,
  type PaymentResponse,
  type SubscriptionStatus,
  type SubscriptionPlan
} from '../schemas/validation';

export interface PaymentProvider {
  id: 'youkassa' | 'robocasa';
  name: string;
  available: boolean;
}

class PaymentService {
  private static instance: PaymentService;
  private baseWebhookUrl = '';
  private errorService: ErrorService;
  private logger: LoggingService;
  private readonly ALLOWED_PAYMENT_DOMAINS = [
    'yookassa.ru',
    'api.yookassa.ru', 
    'robocasa.ru',
    'api.robocasa.ru'
  ];

  constructor() {
    this.errorService = ErrorService.getInstance();
    this.logger = LoggingService.getInstance();
  }

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  setWebhookUrl(url: string) {
    // Валидация webhook URL
    try {
      const parsedUrl = new URL(url);
      if (!parsedUrl.protocol.startsWith('https') && process.env.NODE_ENV === 'production') {
        this.errorService.handleValidationError('Webhook URL должен использовать HTTPS в production');
        return;
      }
      this.baseWebhookUrl = url;
      this.logger.info('Webhook URL установлен', { url: parsedUrl.origin });
    } catch (error) {
      this.errorService.handleValidationError('Невалидный webhook URL', { url });
    }
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

  /**
   * Улучшенная валидация платежных URL
   */
  private validatePaymentUrl(url: string): { isValid: boolean; error?: string } {
    try {
      const parsedUrl = new URL(url);
      
      // Проверка HTTPS
      if (parsedUrl.protocol !== 'https:') {
        return { isValid: false, error: 'Платежная ссылка должна использовать HTTPS' };
      }
      
      // Проверка разрешенных доменов
      const isAllowedDomain = this.ALLOWED_PAYMENT_DOMAINS.some(domain => 
        parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`)
      );
      
      if (!isAllowedDomain) {
        return { isValid: false, error: 'Неразрешенный домен для платежной ссылки' };
      }
      
      // Проверка на подозрительные параметры
      const suspiciousParams = ['script', 'eval', 'javascript', 'data:', 'vbscript'];
      const urlString = url.toLowerCase();
      
      for (const param of suspiciousParams) {
        if (urlString.includes(param)) {
          return { isValid: false, error: 'Подозрительные параметры в платежной ссылке' };
        }
      }
      
      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: 'Невалидный формат URL' };
    }
  }

  async createPayment(paymentData: PaymentData): Promise<PaymentResponse> {
    this.logger.info('Создание платежа', { 
      userId: paymentData.user_id,
      planId: paymentData.plan_id,
      amount: paymentData.amount 
    });
    
    try {
      // Валидация входных данных
      const validationResult = validatePaymentData(paymentData);
      if (!validationResult.success) {
        const error = this.errorService.handleValidationError(
          'Невалидные данные для создания платежа',
          { validationErrors: validationResult.error.issues }
        );
        
        return {
          success: false,
          error: 'Невалидные данные платежа'
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
        const urlValidation = this.validatePaymentUrl(response.payment_url);
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
        const validationResult = validateSubscriptionStatus(response.subscription_status);
        if (!validationResult.success) {
          this.errorService.handleValidationError(
            'Невалидный ответ статуса подписки',
            { validationErrors: validationResult.error.issues }
          );
          return null;
        }
        return validationResult.data;
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
