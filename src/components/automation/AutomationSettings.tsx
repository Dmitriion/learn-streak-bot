
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Settings, Webhook, Zap, CheckCircle2 } from 'lucide-react';
import { useAutomation } from '../../hooks/useAutomation';
import { useToast } from '@/hooks/use-toast';

const AutomationSettings = () => {
  const { triggers, webhookUrl, updateWebhookUrl, toggleTrigger } = useAutomation();
  const { toast } = useToast();
  const [localWebhookUrl, setLocalWebhookUrl] = useState(webhookUrl);

  const handleSaveWebhookUrl = () => {
    if (!localWebhookUrl.trim()) {
      toast({
        title: "Ошибка",
        description: "Укажите URL webhook",
        variant: "destructive",
      });
      return;
    }

    try {
      new URL(localWebhookUrl);
      updateWebhookUrl(localWebhookUrl);
      toast({
        title: "Успешно",
        description: "URL webhook сохранен",
      });
    } catch {
      toast({
        title: "Ошибка",
        description: "Неверный формат URL",
        variant: "destructive",
      });
    }
  };

  const handleToggleTrigger = (triggerId: string, enabled: boolean) => {
    toggleTrigger(triggerId, enabled);
    toast({
      title: enabled ? "Триггер включен" : "Триггер отключен",
      description: `Автоматизация ${triggerId} ${enabled ? 'активирована' : 'деактивирована'}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Настройки автоматизации
        </h2>
      </div>

      {/* Настройка webhook URL */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Webhook className="h-5 w-5" />
            <span>N8N Webhook URL</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Базовый URL вашего N8N instance</Label>
            <Input
              id="webhook-url"
              type="url"
              value={localWebhookUrl}
              onChange={(e) => setLocalWebhookUrl(e.target.value)}
              placeholder="https://your-n8n-instance.com/webhook"
              className="w-full"
            />
          </div>
          <Button onClick={handleSaveWebhookUrl} className="w-full">
            Сохранить URL
          </Button>
          {webhookUrl && (
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Webhook настроен: {webhookUrl}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Список триггеров */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Автоматические триггеры</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {triggers.map((trigger) => (
            <div
              key={trigger.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium">{trigger.name}</h4>
                  <Badge variant={trigger.enabled ? "default" : "secondary"}>
                    {trigger.enabled ? "Активен" : "Отключен"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {trigger.description}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Endpoint: {trigger.webhook_url}
                </p>
              </div>
              <Switch
                checked={trigger.enabled}
                onCheckedChange={(enabled) => handleToggleTrigger(trigger.id, enabled)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Информация об использовании */}
      <Card>
        <CardHeader>
          <CardTitle>Как настроить N8N</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p><strong>1.</strong> Создайте новый workflow в N8N</p>
            <p><strong>2.</strong> Добавьте Webhook триггер с указанными выше endpoint'ами</p>
            <p><strong>3.</strong> Настройте необходимые действия (отправка email, CRM интеграция и т.д.)</p>
            <p><strong>4.</strong> Активируйте workflow</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Совет:</strong> Используйте тестовые webhook'и для проверки интеграции
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomationSettings;
