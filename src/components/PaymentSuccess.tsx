
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Gift, ArrowRight } from 'lucide-react';
import { useTelegram } from '../providers/TelegramProvider';
import { useTelegramNavigation } from '../hooks/useTelegramNavigation';

interface PaymentSuccessProps {
  paymentId?: string;
  planName?: string;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ 
  paymentId, 
  planName = "Премиум" 
}) => {
  const { hapticFeedback, showMainButton, hideMainButton } = useTelegram();
  const { navigate } = useTelegramNavigation();

  useEffect(() => {
    hapticFeedback('heavy');
    
    showMainButton('Перейти к урокам', () => {
      navigate('lessons');
    });

    return () => hideMainButton();
  }, [hapticFeedback, showMainButton, hideMainButton, navigate]);

  const handleGoToLessons = () => {
    hapticFeedback('light');
    navigate('lessons');
  };

  const handleGoToDashboard = () => {
    hapticFeedback('light');
    navigate('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4 flex items-center justify-center">
      <div className="max-w-md mx-auto space-y-6">
        <Card className="text-center border-green-200 shadow-lg">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <div className="absolute inset-0 h-16 w-16 bg-green-500 rounded-full animate-ping opacity-25"></div>
              </div>
            </div>
            
            <CardTitle className="text-2xl text-green-800">
              Оплата прошла успешно!
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-3">
              <p className="text-muted-foreground">
                Поздравляем! Вы успешно приобрели подписку
              </p>
              <div className="bg-green-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <Gift className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    План: {planName}
                  </span>
                </div>
                {paymentId && (
                  <p className="text-xs text-green-600">
                    ID платежа: {paymentId}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-800">
                Теперь вам доступно:
              </h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <span>Все уроки курса</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                  <span>Детальная аналитика прогресса</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span>Сертификат по завершении</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                  <span>Приоритетная поддержка</span>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleGoToDashboard}
                className="flex items-center space-x-2"
              >
                <span>Главная</span>
              </Button>
              <Button 
                size="sm"
                onClick={handleGoToLessons}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <span>К урокам</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Чек о покупке отправлен в Telegram
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Спасибо за доверие! Желаем успехов в обучении 🎓
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
