
import React, { useState, useEffect } from 'react';
import { useTelegram } from '../providers/TelegramProvider';
import PaymentService from '../services/PaymentService';
import { SubscriptionPlan, SubscriptionStatus } from '../schemas/validation';
import { usePayment } from '../hooks/usePayment';
import SubscriptionHeader from './subscription/SubscriptionHeader';
import ActiveSubscriptionCard from './subscription/ActiveSubscriptionCard';
import PlanCard from './subscription/PlanCard';
import PaymentProviderSelector from './subscription/PaymentProviderSelector';
import SecurityInfo from './subscription/SecurityInfo';
import PlansProvider from '../services/payment/PlansProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const Subscription = () => {
  const { user, showMainButton, hideMainButton, hapticFeedback } = useTelegram();
  const { isLoading: isPaymentLoading, processPayment } = usePayment();
  const { toast } = useToast();
  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('telegram');
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  
  // Состояния загрузки
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);

  const paymentService = PaymentService.getInstance();
  const plansProvider = PlansProvider.getInstance();

  useEffect(() => {
    loadPlans();
    loadProviders();
    
    if (user) {
      loadSubscriptionStatus();
    }
  }, [user]);

  useEffect(() => {
    if (selectedPlan && selectedPlan.price > 0) {
      showMainButton(
        `Оплатить ${selectedPlan.price} ₽`,
        () => processPayment(selectedPlan, selectedProvider)
      );
    } else {
      hideMainButton();
    }

    return () => hideMainButton();
  }, [selectedPlan, selectedProvider]);

  const loadPlans = async () => {
    try {
      setIsLoadingPlans(true);
      setPlansError(null);
      
      const availablePlans = await paymentService.getAvailablePlans();
      setPlans(availablePlans);
      
      if (availablePlans.length === 0) {
        setPlansError('Планы временно недоступны');
      }
    } catch (error) {
      console.error('Ошибка загрузки планов:', error);
      setPlansError('Не удалось загрузить планы подписки');
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить планы подписки",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const loadProviders = () => {
    try {
      const providers = plansProvider.getAvailableProviders();
      setAvailableProviders(providers);
      
      const recommendedProvider = plansProvider.getRecommendedProvider();
      setSelectedProvider(recommendedProvider);
    } catch (error) {
      console.error('Ошибка загрузки провайдеров:', error);
    }
  };

  const loadSubscriptionStatus = async () => {
    if (!user) return;
    
    try {
      setIsLoadingSubscription(true);
      const status = await paymentService.getSubscriptionStatus(user.id.toString());
      if (status) {
        setSubscriptionStatus(status);
      }
    } catch (error) {
      console.error('Ошибка загрузки статуса подписки:', error);
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    hapticFeedback('light');
    setSelectedPlan(plan);
  };

  const handleProviderChange = (provider: string) => {
    hapticFeedback('light');
    setSelectedProvider(provider);
  };

  const isCurrentPlan = (planId: string) => {
    return subscriptionStatus?.is_active && subscriptionStatus.plan_id === planId;
  };

  const renderPlansContent = () => {
    if (isLoadingPlans) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      );
    }

    if (plansError) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">{plansError}</p>
          <button 
            onClick={loadPlans}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      );
    }

    if (plans.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Планы подписки не найдены</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isSelected={selectedPlan?.id === plan.id}
            isCurrentPlan={isCurrentPlan(plan.id)}
            isLoading={isPaymentLoading}
            onSelect={handlePlanSelect}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <SubscriptionHeader 
          title="Выберите тарифный план"
          description="Получите полный доступ к обучающей платформе"
        />

        {isLoadingSubscription ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          subscriptionStatus && (
            <ActiveSubscriptionCard 
              subscriptionStatus={subscriptionStatus}
              plans={plans}
            />
          )
        )}

        {renderPlansContent()}

        {selectedPlan && selectedPlan.price > 0 && !isLoadingPlans && (
          <PaymentProviderSelector
            selectedProvider={selectedProvider}
            availableProviders={availableProviders}
            onProviderChange={handleProviderChange}
          />
        )}

        <SecurityInfo />
      </div>
    </div>
  );
};

export default Subscription;
