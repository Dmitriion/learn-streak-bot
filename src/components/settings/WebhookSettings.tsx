
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Webhook, CheckCircle } from 'lucide-react';
import { useTelegram } from '../../providers/TelegramProvider';
import UserRegistrationService from '../../services/UserRegistrationService';
import TelegramValidationService from '../../services/TelegramValidationService';

const WebhookSettings: React.FC = () => {
  const { hapticFeedback } = useTelegram();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const registrationService = UserRegistrationService.getInstance();
  const validationService = TelegramValidationService.getInstance();

  useEffect(() => {
    const savedUrl = localStorage.getItem('n8n_webhook_url') || '';
    setWebhookUrl(savedUrl);
  }, []);

  const handleSaveWebhookUrl = async () => {
    setIsLoading(true);
    hapticFeedback('light');

    try {
      if (webhookUrl.trim()) {
        const validation = validationService.validateWebhookUrl(webhookUrl.trim());
        if (!validation.isValid) {
          alert(`Ошибка валидации URL: ${validation.error}`);
          setIsLoading(false);
          return;
        }
      }

      localStorage.setItem('n8n_webhook_url', webhookUrl.trim());
      registrationService.setWebhookUrl(webhookUrl.trim());
      
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      
      hapticFeedback('medium');
    } catch (error) {
      console.error('Ошибка сохранения URL:', error);
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
          <p className="text-xs text-muted-foreground">
            Оставьте пустым для использования Mock режима в development
          </p>
        </div>

        <Button
          onClick={handleSaveWebhookUrl}
          disabled={isLoading}
          className="w-full"
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
      </CardContent>
    </Card>
  );
};

export default WebhookSettings;
