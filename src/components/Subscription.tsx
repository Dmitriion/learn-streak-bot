
import React, { useState, useEffect } from 'react';
import { useTelegram } from '../providers/TelegramProvider';
import PaymentService from '../services/PaymentService';
import { SubscriptionPlan, SubscriptionStatus } from '../schemas/validation';
import { usePayment } from '../hooks/usePayment';
import SubscriptionHeader from './subscription/SubscriptionHeader';
import ActiveSubscriptionCard from './subscription/ActiveSubscriptionCard';
import PlanCard from './subscription/PlanCard';
import SecurityInfo from './subscription/SecurityInfo';

const Subscription = () => {
  const { user, showMainButton, hideMainButton, hapticFeedback } = useTelegram();
  const { isLoading, processPayment } = usePayment();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

  const paymentService = PaymentService.getInstance();

  useEffect(() => {
    const availablePlans = paymentService.getAvailablePlans();
    setPlans(availablePlans);

    if (user) {
      loadSubscriptionStatus();
    }
  }, [user]);

  useEffect(() => {
    if (selectedPlan && selectedPlan.price > 0) {
      showMainButton(
        `Оплатить ${selectedPlan.price} ₽`,
        () => processPayment(selectedPlan)
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
      if (status) {
        setSubscriptionStatus(status);
      }
    } catch (error) {
      console.error('Ошибка загрузки статуса подписки:', error);
    }
  };

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    hapticFeedback('light');
    setSelectedPlan(plan);
  };

  const isCurrentPlan = (planId: string) => {
    return subscriptionStatus?.is_active && subscriptionStatus.plan_id === planId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <SubscriptionHeader 
          title="Выберите тарифный план"
          description="Получите полный доступ к обучающей платформе"
        />

        {subscriptionStatus && (
          <ActiveSubscriptionCard 
            subscriptionStatus={subscriptionStatus}
            plans={plans}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlan?.id === plan.id}
              isCurrentPlan={isCurrentPlan(plan.id)}
              isLoading={isLoading}
              onSelect={handlePlanSelect}
            />
          ))}
        </div>

        <SecurityInfo />
      </div>
    </div>
  );
};

export default Subscription;
