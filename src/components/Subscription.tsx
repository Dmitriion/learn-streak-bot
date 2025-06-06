
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { useTelegram } from '../providers/TelegramProvider';
import PaymentService, { SubscriptionPlan, SubscriptionStatus } from '../services/PaymentService';
import { useToast } from '@/hooks/use-toast';

const Subscription = () => {
  const { user, showMainButton, hideMainButton, hapticFeedback, showAlert } = useTelegram();
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const paymentService = PaymentService.getInstance();

  useEffect(() => {
    // Загружаем доступные планы
    const availablePlans = paymentService.getAvailablePlans();
    setPlans(availablePlans);

    // Загружаем текущий статус подписки
    if (user) {
      loadSubscriptionStatus();
    }
  }, [user]);

  useEffect(() => {
    // Управление главной кнопкой Telegram
    if (selectedPlan && selectedPlan.price > 0) {
      showMainButton(
        `Оплатить ${selectedPlan.price} ₽`,
        handlePayment
      );
    } else {
      hideMainButton();
    }

    return () => hideMainButton();
  }, [selectedPlan]);

  const loadSubscriptionStatus = async () => {
    if (!user) return;
    
    try {
      const status = await paymentService.getSubscriptionStatus(user.id.toString());
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Ошибка загрузки статуса подписки:', error);
    }
  };

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    hapticFeedback('light');
    setSelectedPlan(plan);
  };

  const handlePayment = async () => {
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

      const result = await paymentService.createPayment(paymentData);

      if (result.success && result.payment_url) {
        // Открываем платежную форму в Telegram
        if (window.Telegram?.WebApp?.openLink) {
          window.Telegram.WebApp.openLink(result.payment_url);
        } else {
          // Fallback для разработки
          window.open(result.payment_url, '_blank');
        }

        toast({
          title: "Переход к оплате",
          description: "Вы будете перенаправлены на страницу оплаты",
        });
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

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'basic':
        return <Star className="h-6 w-6 text-blue-600" />;
      case 'premium':
        return <Zap className="h-6 w-6 text-purple-600" />;
      case 'vip':
        return <Crown className="h-6 w-6 text-yellow-600" />;
      default:
        return <Star className="h-6 w-6" />;
    }
  };

  const isCurrentPlan = (planId: string) => {
    return subscriptionStatus?.is_active && subscriptionStatus.plan_id === planId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Выберите тарифный план
          </h1>
          <p className="text-muted-foreground">
            Получите полный доступ к обучающей платформе
          </p>
        </div>

        {subscriptionStatus?.is_active && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium text-green-800">Активная подписка</p>
                  <p className="text-sm text-green-600">
                    План: {plans.find(p => p.id === subscriptionStatus.plan_id)?.name}
                  </p>
                  <p className="text-sm text-green-600">
                    Действует до: {new Date(subscriptionStatus.expires_at).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                selectedPlan?.id === plan.id
                  ? 'ring-2 ring-blue-500 shadow-lg'
                  : ''
              } ${isCurrentPlan(plan.id) ? 'border-green-500 bg-green-50' : ''}`}
              onClick={() => handlePlanSelect(plan)}
            >
              {plan.popular && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600">
                  Популярный
                </Badge>
              )}
              
              {isCurrentPlan(plan.id) && (
                <Badge className="absolute -top-2 right-4 bg-green-500">
                  Активен
                </Badge>
              )}

              <CardHeader className="text-center space-y-4">
                <div className="flex justify-center">
                  {getPlanIcon(plan.id)}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">
                    {plan.price === 0 ? 'Бесплатно' : `${plan.price} ₽`}
                  </div>
                  {plan.price > 0 && (
                    <CardDescription>на {plan.duration} дней</CardDescription>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {!isCurrentPlan(plan.id) && (
                  <Button
                    variant={selectedPlan?.id === plan.id ? "default" : "outline"}
                    className="w-full"
                    disabled={isLoading}
                  >
                    {plan.price === 0 ? 'Текущий план' : 'Выбрать план'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center space-y-4 pt-6">
          <p className="text-sm text-muted-foreground">
            Безопасная оплата через проверенные платежные системы
          </p>
          <div className="flex justify-center space-x-4 text-xs text-muted-foreground">
            <span>🔒 SSL шифрование</span>
            <span>💳 Поддержка карт</span>
            <span>📱 Telegram Payments</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
