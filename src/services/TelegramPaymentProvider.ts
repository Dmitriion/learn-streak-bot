
import { PaymentData, PaymentResponse } from '../schemas/validation';
import LoggingService from './LoggingService';
import ErrorService from './ErrorService';
import { N8NWebhookClient } from './automation/N8NWebhookClient';

export interface TelegramInvoiceData {
  title: string;
  description: string;
  payload: string;
  currency: string;
  prices: Array<{
    label: string;
    amount: number;
  }>;
}

class TelegramPaymentProvider {
  private logger: LoggingService;
  private errorService: ErrorService;
  private webhookClient: N8NWebhookClient;
  private readonly providerName = 'telegram';

  constructor() {
    this.logger = LoggingService.getInstance();
    this.errorService = ErrorService.getInstance();
    this.webhookClient = new N8NWebhookClient();
  }

  async createPayment(paymentData: PaymentData): Promise<PaymentResponse> {
    this.logger.info('Создание Telegram платежа', { 
      userId: paymentData.user_id,
      amount: paymentData.amount 
    });

    try {
      // Формируем данные для создания invoice через N8N
      const invoiceData: TelegramInvoiceData = {
        title: `Подписка ${paymentData.plan_id}`,
        description: `Оплата подписки на сумму ${paymentData.amount} ${paymentData.currency}`,
        payload: JSON.stringify({
          user_id: paymentData.user_id,
          plan_id: paymentData.plan_id,
          timestamp: Date.now()
        }),
        currency: paymentData.currency,
        prices: [{
          label: `План ${paymentData.plan_id}`,
          amount: Math.round(paymentData.amount * 100) // Telegram требует копейки
        }]
      };

      // Отправляем запрос на создание invoice через N8N
      const webhookUrl = this.getCreateInvoiceWebhookUrl();
      const success = await this.webhookClient.sendRequest(webhookUrl, {
        action: 'create_invoice',
        invoice_data: invoiceData,
        user_id: paymentData.user_id
      });

      if (success) {
        this.logger.info('Telegram invoice создан успешно');
        
        // Возвращаем успешный ответ с инструкциями для пользователя
        return {
          success: true,
          payment_id: `tg_${Date.now()}_${paymentData.user_id}`,
          message: 'Invoice создан. Ожидайте уведомление в Telegram.'
        };
      } else {
        throw new Error('Не удалось создать invoice через N8N');
      }
    } catch (error) {
      this.errorService.handleError({
        category: 'payment',
        message: 'Ошибка создания Telegram платежа',
        originalError: error as Error,
        context: { paymentData },
        recoverable: true
      });

      return {
        success: false,
        error: 'Ошибка создания Telegram платежа'
      };
    }
  }

  async validatePayment(paymentData: any): Promise<boolean> {
    try {
      this.logger.info('Валидация Telegram платежа', { paymentData });

      // Проверяем обязательные поля
      if (!paymentData.invoice_payload || !paymentData.total_amount) {
        this.logger.warn('Отсутствуют обязательные поля в данных платежа');
        return false;
      }

      // Парсим payload для проверки
      const payload = JSON.parse(paymentData.invoice_payload);
      if (!payload.user_id || !payload.plan_id) {
        this.logger.warn('Невалидный payload в данных платежа');
        return false;
      }

      // Отправляем данные на валидацию через N8N
      const webhookUrl = this.getValidatePaymentWebhookUrl();
      const isValid = await this.webhookClient.sendRequest(webhookUrl, {
        action: 'validate_payment',
        payment_data: paymentData,
        timestamp: Date.now()
      });

      this.logger.info('Результат валидации Telegram платежа', { isValid });
      return isValid;
    } catch (error) {
      this.errorService.handleError({
        category: 'payment',
        message: 'Ошибка валидации Telegram платежа',
        originalError: error as Error,
        context: { paymentData },
        recoverable: true
      });
      return false;
    }
  }

  async checkPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    try {
      // Отправляем запрос на проверку статуса через N8N
      const webhookUrl = this.getCheckStatusWebhookUrl();
      const result = await this.webhookClient.sendRequest(webhookUrl, {
        action: 'check_payment_status',
        payment_id: paymentId
      });

      return {
        success: !!result,
        payment_id: paymentId,
        message: result ? 'Платеж найден' : 'Платеж не найден'
      };
    } catch (error) {
      this.errorService.handleError({
        category: 'payment',
        message: 'Ошибка проверки статуса Telegram платежа',
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

  private getCreateInvoiceWebhookUrl(): string {
    const baseUrl = localStorage.getItem('n8n_webhook_url') || '';
    return `${baseUrl}/telegram/create-invoice`;
  }

  private getValidatePaymentWebhookUrl(): string {
    const baseUrl = localStorage.getItem('n8n_webhook_url') || '';
    return `${baseUrl}/telegram/validate-payment`;
  }

  private getCheckStatusWebhookUrl(): string {
    const baseUrl = localStorage.getItem('n8n_webhook_url') || '';
    return `${baseUrl}/telegram/check-status`;
  }
}

export default TelegramPaymentProvider;
