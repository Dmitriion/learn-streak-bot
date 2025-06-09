
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

  const processPayment = async (selectedPlan: SubscriptionPlan, provider: string = 'telegram') => {
    if (!selectedPlan || !user) return;

    setIsLoading(true);
    hapticFeedback('medium');

    try {
      const paymentData = {
        user_id: user.id.toString(),
        plan_id: selectedPlan.id,
        amount: selectedPlan.price,
        currency: selectedPlan.currency,
        provider: provider as 'youkassa' | 'robocasa' | 'telegram',
        return_url: window.location.origin
      };

      console.log('Создание платежа:', paymentData);
      
      const result = await paymentService.createPayment(paymentData);

      if (result.success) {
        if (provider === 'telegram') {
          toast({
            title: "Платеж создан",
            description: "Ожидайте уведомление в Telegram для завершения оплаты",
          });
        } else if (result.payment_url) {
          toast({
            title: "Переход к оплате",
            description: "Вы будете перенаправлены на страницу оплаты",
          });

          setTimeout(() => {
            if (window.Telegram?.WebApp?.openLink) {
              window.Telegram.WebApp.openLink(result.payment_url!);
            } else {
              window.open(result.payment_url!, '_blank');
            }
          }, 1000);
        }
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
