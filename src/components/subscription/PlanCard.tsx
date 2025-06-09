
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap, Loader2 } from 'lucide-react';
import { SubscriptionPlan } from '../../schemas/validation';

interface PlanCardProps {
  plan: SubscriptionPlan;
  isSelected: boolean;
  isCurrentPlan: boolean;
  isLoading: boolean;
  onSelect: (plan: SubscriptionPlan) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isSelected,
  isCurrentPlan,
  isLoading,
  onSelect
}) => {
  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
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

  const getButtonText = () => {
    if (isCurrentPlan) return 'Текущий план';
    if (plan.price === 0) return 'Бесплатный план';
    if (isSelected && isLoading) return 'Обработка...';
    return 'Выбрать план';
  };

  const getButtonVariant = () => {
    if (isCurrentPlan) return 'secondary';
    if (isSelected) return 'default';
    return 'outline';
  };

  return (
    <Card
      className={`relative cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
        isSelected ? 'ring-2 ring-primary shadow-lg' : ''
      } ${isCurrentPlan ? 'border-green-500 bg-green-50' : ''} ${
        isLoading && isSelected ? 'opacity-75' : ''
      }`}
      onClick={() => !isCurrentPlan && !isLoading && onSelect(plan)}
    >
      {plan.popular && (
        <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600">
          Популярный
        </Badge>
      )}
      
      {isCurrentPlan && (
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

        <Button
          variant={getButtonVariant() as any}
          className="w-full"
          disabled={isCurrentPlan || (isLoading && isSelected)}
          onClick={(e) => {
            e.stopPropagation();
            if (!isCurrentPlan && !isLoading) {
              onSelect(plan);
            }
          }}
        >
          {isLoading && isSelected && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {getButtonText()}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PlanCard;
