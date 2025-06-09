
import { useCallback } from 'react';
import LoggingService from '../../services/LoggingService';
import { useToast } from '@/hooks/use-toast';

export const useTelegramPayments = () => {
  const logger = LoggingService.getInstance();
  const { toast } = useToast();

  const openInvoice = useCallback((invoiceLink: string, callback?: (status: string) => void) => {
    if (window.Telegram?.WebApp?.openInvoice) {
      window.Telegram.WebApp.openInvoice(invoiceLink, (status) => {
        logger.info('Telegram payment status', { status });
        
        if (status === 'paid') {
          toast({
            title: "Платеж успешен",
            description: "Ваш платеж был обработан успешно",
          });
        } else if (status === 'cancelled') {
          toast({
            title: "Платеж отменен",
            description: "Вы отменили платеж",
            variant: "destructive",
          });
        } else if (status === 'failed') {
          toast({
            title: "Ошибка платежа",
            description: "Не удалось обработать платеж",
            variant: "destructive",
          });
        }
        
        if (callback) callback(status);
      });
    } else {
      logger.warn('Telegram WebApp openInvoice не доступен');
      toast({
        title: "Ошибка",
        description: "Telegram платежи недоступны",
        variant: "destructive",
      });
      if (callback) callback('unavailable');
    }
  }, [logger, toast]);

  const validatePayment = useCallback(async (paymentData: any): Promise<boolean> => {
    try {
      logger.info('Валидация платежа запрошена на фронтенде', { paymentData });
      
      // ВАЖНО: Реальная валидация должна происходить только на бэкенде
      // Здесь только базовая проверка структуры данных
      if (!paymentData || !paymentData.invoice_payload) {
        logger.warn('Отсутствуют обязательные данные платежа');
        return false;
      }

      // Все серьезная валидация должна происходить через PaymentService
      // который отправляет данные на бэкенд для проверки
      return true;
    } catch (error) {
      logger.error('Ошибка валидации платежа', { error });
      return false;
    }
  }, [logger]);

  return {
    openInvoice,
    validatePayment
  };
};
