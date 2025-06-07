
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Webhook, Database, Trash2, CheckCircle } from 'lucide-react';
import { useTelegram } from '../../providers/TelegramProvider';
import UserRegistrationService from '../../services/UserRegistrationService';
import TelegramValidationService from '../../services/TelegramValidationService';

const SettingsPage: React.FC = () => {
  const { hapticFeedback } = useTelegram();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const registrationService = UserRegistrationService.getInstance();
  const validationService = TelegramValidationService.getInstance();
  
  const isUsingMockMode = registrationService.isUsingMockMode();
  const environmentInfo = validationService.getEnvironmentInfo();
  const mockUsers = registrationService.getMockData();

  useEffect(() => {
    // Проверяем сохраненный URL
    const savedUrl = localStorage.getItem('n8n_webhook_url') || '';
    setWebhookUrl(savedUrl);
  }, []);

  const handleSaveWebhookUrl = async () => {
    setIsLoading(true);
    hapticFeedback('light');

    try {
      // Валидируем URL если он введен
      if (webhookUrl.trim()) {
        const validation = validationService.validateWebhookUrl(webhookUrl.trim());
        if (!validation.isValid) {
          alert(`Ошибка валидации URL: ${validation.error}`);
          setIsLoading(false);
          return;
        }
      }

      // Сохраняем URL
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

  const handleClearMockData = () => {
    if (confirm('Вы уверены, что хотите очистить все тестовые данные?')) {
      registrationService.clearMockData();
      hapticFeedback('heavy');
      window.location.reload();
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="text-center space-y-3">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Settings className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Настройки
        </h1>
      </div>

      {/* Информация о среде */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Информация о среде
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span>Режим разработки:</span>
            <Badge variant={environmentInfo.isDevelopment ? "default" : "secondary"}>
              {environmentInfo.isDevelopment ? "Да" : "Нет"}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>Telegram App:</span>
            <Badge variant={environmentInfo.isTelegramApp ? "default" : "secondary"}>
              {environmentInfo.isTelegramApp ? "Да" : "Нет"}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>Платформа:</span>
            <Badge variant="outline">{environmentInfo.platform}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>Mock режим:</span>
            <Badge variant={isUsingMockMode ? "destructive" : "default"}>
              {isUsingMockMode ? "Активен" : "Отключен"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Настройка N8N Webhook */}
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

      {/* Mock данные */}
      {isUsingMockMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Mock данные ({mockUsers.length} пользователей)</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearMockData}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Очистить
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mockUsers.length === 0 ? (
              <p className="text-muted-foreground text-sm">Нет тестовых данных</p>
            ) : (
              <div className="space-y-2">
                {mockUsers.slice(0, 3).map((user, index) => (
                  <div key={index} className="p-2 bg-muted rounded text-xs">
                    <div className="font-medium">{user.full_name}</div>
                    <div className="text-muted-foreground">
                      ID: {user.user_id} | Урок: {user.current_lesson} | Очки: {user.score}
                    </div>
                  </div>
                ))}
                {mockUsers.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    И еще {mockUsers.length - 3} пользователей...
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SettingsPage;
