
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Smartphone } from 'lucide-react';

interface PaymentProviderSelectorProps {
  selectedProvider: string;
  availableProviders: string[];
  onProviderChange: (provider: string) => void;
}

const PaymentProviderSelector: React.FC<PaymentProviderSelectorProps> = ({
  selectedProvider,
  availableProviders,
  onProviderChange
}) => {
  const getProviderInfo = (provider: string) => {
    switch (provider) {
      case 'telegram':
        return {
          name: 'Telegram Payments',
          icon: <Smartphone className="w-5 h-5" />,
          description: 'Быстрая оплата через Telegram',
          recommended: true
        };
      case 'youkassa':
        return {
          name: 'ЮKassa',
          icon: <CreditCard className="w-5 h-5" />,
          description: 'Банковские карты, электронные кошельки',
          recommended: false
        };
      case 'robocasa':
        return {
          name: 'RoboCasa',
          icon: <CreditCard className="w-5 h-5" />,
          description: 'Альтернативные способы оплаты',
          recommended: false
        };
      default:
        return {
          name: provider,
          icon: <CreditCard className="w-5 h-5" />,
          description: 'Платежная система',
          recommended: false
        };
    }
  };

  if (availableProviders.length <= 1) {
    return null; // Не показываем селектор если доступен только один провайдер
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">Способ оплаты</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {availableProviders.map((provider) => {
          const info = getProviderInfo(provider);
          const isSelected = selectedProvider === provider;
          
          return (
            <Card
              key={provider}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => onProviderChange(provider)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {info.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {info.name}
                      </h4>
                      {info.recommended && (
                        <Badge variant="secondary" className="text-xs">
                          Рекомендуется
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {info.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentProviderSelector;
