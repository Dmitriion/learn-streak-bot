
import ErrorService from '../ErrorService';
import { 
  validatePaymentData, 
  validateSubscriptionStatus,
  type PaymentData,
  type SubscriptionStatus 
} from '../../schemas/validation';

class PaymentValidator {
  private errorService: ErrorService;
  private readonly ALLOWED_PAYMENT_DOMAINS = [
    'yookassa.ru',
    'api.yookassa.ru', 
    'robocasa.ru',
    'api.robocasa.ru'
  ];

  constructor() {
    this.errorService = ErrorService.getInstance();
  }

  validatePaymentData(data: PaymentData) {
    const validationResult = validatePaymentData(data);
    if (!validationResult.success) {
      this.errorService.handleValidationError(
        'Невалидные данные для создания платежа',
        { validationErrors: validationResult.error.issues }
      );
      return { isValid: false, error: 'Невалидные данные платежа' };
    }
    return { isValid: true, data: validationResult.data };
  }

  validateSubscriptionStatus(data: any) {
    if (!data) return { isValid: false, error: 'Нет данных статуса подписки' };
    
    const validationResult = validateSubscriptionStatus(data);
    if (!validationResult.success) {
      this.errorService.handleValidationError(
        'Невалидный ответ статуса подписки',
        { validationErrors: validationResult.error.issues }
      );
      return { isValid: false, error: 'Невалидный статус подписки' };
    }
    return { isValid: true, data: validationResult.data };
  }

  validatePaymentUrl(url: string): { isValid: boolean; error?: string } {
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

  validateWebhookUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      if (!parsedUrl.protocol.startsWith('https') && process.env.NODE_ENV === 'production') {
        this.errorService.handleValidationError('Webhook URL должен использовать HTTPS в production');
        return false;
      }
      return true;
    } catch (error) {
      this.errorService.handleValidationError('Невалидный webhook URL', { url });
      return false;
    }
  }
}

export default PaymentValidator;
