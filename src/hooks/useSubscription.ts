
import { useState, useEffect } from 'react';
import { useTelegram } from '../providers/TelegramProvider';
import PaymentService from '../services/PaymentService';
import { SubscriptionStatus } from '../schemas/validation';

export const useSubscription = () => {
  const { user } = useTelegram();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paymentService = PaymentService.getInstance();

  useEffect(() => {
    if (user) {
      loadSubscriptionStatus();
    }
  }, [user]);

  const loadSubscriptionStatus = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const status = await paymentService.getSubscriptionStatus(user.id.toString());
      if (status) {
        setSubscriptionStatus(status);
      }
    } catch (err) {
      console.error('Ошибка загрузки статуса подписки:', err);
      setError('Не удалось загрузить статус подписки');
    } finally {
      setIsLoading(false);
    }
  };

  const hasActiveSubscription = () => {
    return subscriptionStatus?.is_active || false;
  };

  const hasAccess = (feature: 'lessons' | 'analytics' | 'certificates' | 'support') => {
    if (!subscriptionStatus?.is_active) {
      // Бесплатный доступ только к базовым функциям
      return feature === 'lessons' ? false : false;
    }

    const planId = subscriptionStatus.plan_id;
    
    switch (feature) {
      case 'lessons':
        return ['premium', 'vip'].includes(planId);
      case 'analytics':
        return ['premium', 'vip'].includes(planId);
      case 'certificates':
        return ['premium', 'vip'].includes(planId);
      case 'support':
        return planId === 'vip';
      default:
        return false;
    }
  };

  const getDaysUntilExpiry = () => {
    if (!subscriptionStatus?.expires_at) return null;
    
    const expiryDate = new Date(subscriptionStatus.expires_at);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  const isExpiringSoon = () => {
    const daysUntilExpiry = getDaysUntilExpiry();
    return daysUntilExpiry !== null && daysUntilExpiry <= 7;
  };

  const getCurrentPlanName = () => {
    if (!subscriptionStatus?.is_active) return 'Бесплатный';
    
    const planNames = {
      'basic': 'Базовый',
      'premium': 'Премиум',
      'vip': 'VIP'
    };
    
    return planNames[subscriptionStatus.plan_id as keyof typeof planNames] || 'Неизвестный';
  };

  return {
    subscriptionStatus,
    isLoading,
    error,
    hasActiveSubscription,
    hasAccess,
    getDaysUntilExpiry,
    isExpiringSoon,
    getCurrentPlanName,
    refreshStatus: loadSubscriptionStatus
  };
};
