
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SubscriptionStatus, SubscriptionPlan } from '../../schemas/validation';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface ActiveSubscriptionCardProps {
  subscriptionStatus: SubscriptionStatus;
  plans: SubscriptionPlan[];
}

const ActiveSubscriptionCard: React.FC<ActiveSubscriptionCardProps> = ({ 
  subscriptionStatus, 
  plans 
}) => {
  if (!subscriptionStatus.is_active) return null;

  const currentPlan = plans.find(p => p.id === subscriptionStatus.plan_id);
  const expiryDate = new Date(subscriptionStatus.expires_at);
  const now = new Date();
  const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysLeft <= 7 && daysLeft > 0;
  const isExpired = daysLeft <= 0;

  const getStatusColor = () => {
    if (isExpired) return 'destructive';
    if (isExpiringSoon) return 'warning';
    return 'success';
  };

  const getStatusIcon = () => {
    if (isExpired || isExpiringSoon) {
      return <AlertTriangle className="h-3 w-3" />;
    }
    return <CheckCircle className="h-3 w-3" />;
  };

  const getStatusText = () => {
    if (isExpired) return 'Подписка истекла';
    if (isExpiringSoon) return 'Подписка истекает скоро';
    return 'Активная подписка';
  };

  const getBorderColor = () => {
    if (isExpired) return 'border-red-200 bg-red-50';
    if (isExpiringSoon) return 'border-yellow-200 bg-yellow-50';
    return 'border-green-200 bg-green-50';
  };

  const getTextColor = () => {
    if (isExpired) return 'text-red-800';
    if (isExpiringSoon) return 'text-yellow-800';
    return 'text-green-800';
  };

  const getSecondaryTextColor = () => {
    if (isExpired) return 'text-red-600';
    if (isExpiringSoon) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Card className={getBorderColor()}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
            isExpired ? 'bg-red-500' : isExpiringSoon ? 'bg-yellow-500' : 'bg-green-500'
          }`}>
            <div className="text-white">
              {getStatusIcon()}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <p className={`font-medium ${getTextColor()}`}>
                {getStatusText()}
              </p>
              <Badge variant={getStatusColor() as any} className="text-xs">
                {currentPlan?.name || 'Неизвестный план'}
              </Badge>
            </div>
            <div className="mt-1 space-y-1">
              <p className={`text-sm ${getSecondaryTextColor()}`}>
                {isExpired 
                  ? `Истекла: ${expiryDate.toLocaleDateString('ru-RU')}`
                  : `Действует до: ${expiryDate.toLocaleDateString('ru-RU')}`
                }
              </p>
              {!isExpired && (
                <p className={`text-xs ${getSecondaryTextColor()}`}>
                  {daysLeft > 0 
                    ? `Осталось дней: ${daysLeft}`
                    : 'Истекает сегодня'
                  }
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveSubscriptionCard;
