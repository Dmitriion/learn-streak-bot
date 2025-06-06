
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SubscriptionStatus, SubscriptionPlan } from '../../schemas/validation';

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

  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
          <div>
            <p className="font-medium text-green-800">Активная подписка</p>
            <p className="text-sm text-green-600">
              План: {currentPlan?.name}
            </p>
            <p className="text-sm text-green-600">
              Действует до: {new Date(subscriptionStatus.expires_at).toLocaleDateString('ru-RU')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveSubscriptionCard;
