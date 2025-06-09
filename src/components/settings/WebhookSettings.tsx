
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Webhook, CheckCircle, AlertTriangle } from 'lucide-react';
import { useTelegram } from '../../providers/TelegramProvider';
import UserRegistrationService from '../../services/UserRegistrationService';
import AutomationManager from '../../services/automation/AutomationManager';
import { toast } from '@/hooks/use-toast';

const WebhookSettings: React.FC = () => {
  const { hapticFeedback } = useTelegram();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  
  const registrationService = UserRegistrationService.getInstance();
  const automationManager = AutomationManager.getInstance();

  useEffect(() => {
    const savedUrl = localStorage.getItem('n8n_webhook_url') || '';
    setWebhookUrl(savedUrl);
  }, []);

  const handleSaveWebhookUrl = async () => {
    setIsLoading(true);
    setValidationError('');
    hapticFeedback('light');

    try {
      // Сохраняем URL в обоих сервисах
      registrationService.setWebhookUrl(webhookUrl.trim());
      automationManager.setN8NWebhookUrl(webhookUrl.trim());
      
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      
      toast({
        title: "Настройки сохранены",
        description: webhookUrl.trim() ? "Webhook URL обновлен" : "Webhook URL очищен",
      });
      
      hapticFeedback('medium');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setValidationError(errorMessage);
      
      toast({
        title: "Ошибка сохранения",
        description: errorMessage,
        variant: "destructive",
      });
      
      hapticFeedback('heavy');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите webhook URL для тестирования",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    hapticFeedback('light');

    try {
      const result = await automationManager.testConnection();
      
      if (result) {
        toast({
          title: "Соединение успешно",
          description: "N8N webhook доступен и работает",
        });
        hapticFeedback('medium');
      } else {
        toast({
          title: "Ошибка соединения",
          description: "Не удалось подключиться к N8N webhook",
          variant: "destructive",
        });
        hapticFeedback('heavy');
      }
    } catch (error) {
      toast({
        title: "Ошибка тестирования",
        description: "Произошла ошибка при тестировании соединения",
        variant: "destructive",
      });
      hapticFeedback('heavy');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          N8N Webhook URL
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="webhookUrl">URL вашего N8N webhook</Label>
          <Input
            id="webhookUrl"
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://your-n8n-instance.com/webhook/..."
            className="text-sm"
          />
          
          {validationError && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertTriangle className="h-4 w-4" />
              {validationError}
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            Оставьте пустым для использования Mock режима в development
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSaveWebhookUrl}
            disabled={isLoading}
            className="flex-1"
          >
            {isSaved ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Сохранено
              </>
            ) : (
              'Сохранить URL'
            )}
          </Button>
          
          <Button
            onClick={handleTestConnection}
            disabled={isLoading || !webhookUrl.trim()}
            variant="outline"
          >
            Тест
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebhookSettings;
