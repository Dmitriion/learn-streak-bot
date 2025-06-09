
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { useTelegram } from '../../providers/TelegramProvider';
import { useSetupWizard } from '../../hooks/useSetupWizard';

const QuickActions: React.FC = () => {
  const { hapticFeedback } = useTelegram();
  const { resetSetup } = useSetupWizard();

  const handleResetSetup = () => {
    if (confirm('Вы уверены, что хотите запустить мастер настройки заново? Это не удалит ваши данные.')) {
      resetSetup();
      hapticFeedback('heavy');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Быстрые действия</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={handleResetSetup}
          variant="outline"
          className="w-full flex items-center justify-center space-x-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Запустить мастер настройки</span>
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Повторно пройти процесс настройки Telegram бота и автоматизации
        </p>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
