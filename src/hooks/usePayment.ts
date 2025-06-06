
import { useState } from 'react';
import { useTelegram } from '../providers/TelegramProvider';
import PaymentService from '../services/PaymentService';
import { SubscriptionPlan } from '../schemas/validation';
import { useToast } from '@/hooks/use-toast';

export const usePayment = () => {
  const { user, hapticFeedback, showAlert } = useTelegram();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const paymentService = PaymentService.getInstance();

  const isValidPaymentUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      const allowedDomains = ['yookassa.ru', 'robocasa.ru', 'api.yookassa.ru', 'api.robocasa.ru'];
      return allowedDomains.some(domain => urlObj.hostname.includes(domain));
    } catch {
      return false;
    }
  };

  const openPaymentUrl = (url: string) => {
    console.log('Открытие платежной ссылки:', url);
    
    if (!isValidPaymentUrl(url)) {
      console.error('Небезопасная платежная ссылка:', url);
      showAlert('Ошибка: небезопасная платежная ссылка');
      return;
    }

    if (window.Telegram?.WebApp?.openLink) {
      try {
        window.Telegram.WebApp.openLink(url);
        console.log('Платежная ссылка открыта через Telegram WebApp');
      } catch (error) {
        console.error('Ошибка открытия ссылки через Telegram:', error);
        window.open(url, '_blank');
      }
    } else {
      console.log('Telegram WebApp недоступен, используем window.open');
      window.open(url, '_blank');
    }
  };

  const processPayment = async (selectedPlan: SubscriptionPlan) => {
    if (!selectedPlan || !user) return;

    setIsLoading(true);
    hapticFeedback('medium');

    try {
      const paymentData = {
        user_id: user.id.toString(),
        plan_id: selectedPlan.id,
        amount: selectedPlan.price,
        currency: selectedPlan.currency,
        provider: 'youkassa' as const,
        return_url: window.location.origin
      };

      console.log('Создание платежа:', paymentData);
      
      const result = await paymentService.createPayment(paymentData);

      if (result.success && result.payment_url) {
        toast({
          title: "Переход к оплате",
          description: "Вы будете перенаправлены на страницу оплаты",
        });

        setTimeout(() => {
          openPaymentUrl(result.payment_url!);
        }, 1000);

      } else {
        throw new Error(result.error || 'Ошибка создания платежа');
      }
    } catch (error) {
      console.error('Ошибка оплаты:', error);
      showAlert('Ошибка при создании платежа. Попробуйте позже.');
      toast({
        title: "Ошибка оплаты",
        description: "Не удалось создать платеж. Попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    processPayment
  };
};
