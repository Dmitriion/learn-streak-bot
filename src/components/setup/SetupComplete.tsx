
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Rocket, ExternalLink, Download, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SetupCompleteProps {
  setupState: {
    telegramBotToken: string;
    telegramBotUsername: string;
    n8nWebhookUrl: string;
    isN8NTested: boolean;
    isTelegramConfigured: boolean;
  };
}

const SetupComplete: React.FC<SetupCompleteProps> = ({ setupState }) => {
  const { toast } = useToast();

  const generateTelegramBotCommands = () => {
    return [
      {
        command: 'start',
        description: 'Начать обучение'
      },
      {
        command: 'progress',
        description: 'Показать мой прогресс'
      },
      {
        command: 'lesson',
        description: 'Следующий урок'
      },
      {
        command: 'help',
        description: 'Помощь и поддержка'
      }
    ];
  };

  const generateMiniAppUrl = () => {
    const currentUrl = window.location.origin;
    return `https://t.me/${setupState.telegramBotUsername}?startapp=launch`;
  };

  const copyBotCommands = () => {
    const commands = generateTelegramBotCommands();
    const commandsText = commands.map(cmd => `${cmd.command} - ${cmd.description}`).join('\n');
    
    navigator.clipboard.writeText(commandsText);
    toast({
      title: "Скопировано!",
      description: "Команды бота скопированы в буфер обмена",
    });
  };

  const copyMiniAppUrl = () => {
    const url = generateMiniAppUrl();
    navigator.clipboard.writeText(url);
    toast({
      title: "Скопировано!",
      description: "Ссылка на Mini App скопирована",
    });
  };

  const openTelegramBot = () => {
    const url = `https://t.me/${setupState.telegramBotUsername}`;
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const downloadConfig = () => {
    const config = {
      telegram: {
        bot_token: setupState.telegramBotToken,
        bot_username: setupState.telegramBotUsername,
        mini_app_url: generateMiniAppUrl()
      },
      automation: {
        n8n_webhook_url: setupState.n8nWebhookUrl,
        tested: setupState.isN8NTested
      },
      setup_date: new Date().toISOString(),
      app_version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'education-app-config.json';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Конфигурация сохранена!",
      description: "Файл настроек скачан на ваше устройство",
    });
  };

  return (
    <div className="space-y-6">
      {/* Поздравление */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Rocket className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            🎉 Поздравляем! Настройка завершена
          </h2>
          <p className="text-green-700">
            Ваше образовательное приложение готово к работе. Теперь можно запускать бота и начинать обучение!
          </p>
        </CardContent>
      </Card>

      {/* Сводка настроек */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span>Сводка настроек</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Telegram бот:</span>
                <Badge variant="default">Настроен</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                @{setupState.telegramBotUsername}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Автоматизация:</span>
                <Badge variant={setupState.isN8NTested ? "default" : "secondary"}>
                  {setupState.isN8NTested ? "Протестирована" : "Настроена"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {setupState.n8nWebhookUrl ? "N8N подключен" : "Работает в тестовом режиме"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Следующие шаги */}
      <Card>
        <CardHeader>
          <CardTitle>Следующие шаги</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Настройка команд бота */}
          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              1
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-800">Настройте команды бота</h4>
              <p className="text-sm text-blue-700 mb-3">
                Добавьте команды в вашего бота через @BotFather командой /setcommands
              </p>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={copyBotCommands}>
                  <Download className="h-4 w-4 mr-1" />
                  Скопировать команды
                </Button>
                <Button size="sm" variant="outline" onClick={openTelegramBot}>
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Открыть бота
                </Button>
              </div>
            </div>
          </div>

          {/* Настройка Mini App */}
          <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              2
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-purple-800">Подключите Mini App</h4>
              <p className="text-sm text-purple-700 mb-3">
                Добавьте ссылку на Mini App в настройки бота через @BotFather командой /newapp
              </p>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={copyMiniAppUrl}>
                  <Share2 className="h-4 w-4 mr-1" />
                  Скопировать ссылку
                </Button>
              </div>
              <p className="text-xs text-purple-600 mt-2">
                Ссылка: {generateMiniAppUrl()}
              </p>
            </div>
          </div>

          {/* Тестирование */}
          <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              3
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-green-800">Протестируйте приложение</h4>
              <p className="text-sm text-green-700">
                Откройте бота в Telegram и протестируйте все функции: регистрацию, уроки, тесты
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Полезные ссылки */}
      <Card>
        <CardHeader>
          <CardTitle>Полезные материалы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Документация:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• <a href="https://core.telegram.org/bots" target="_blank" className="text-blue-600 hover:underline">Telegram Bot API</a></li>
                <li>• <a href="https://docs.n8n.io" target="_blank" className="text-blue-600 hover:underline">N8N Documentation</a></li>
                <li>• <a href="https://core.telegram.org/bots/webapps" target="_blank" className="text-blue-600 hover:underline">Telegram Mini Apps</a></li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Поддержка:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Сохраните файл конфигурации</li>
                <li>• Сделайте резервную копию токена</li>
                <li>• Проверьте работу уведомлений</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <Button onClick={downloadConfig} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Скачать конфигурацию приложения
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupComplete;
