
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SetupWizard from './SetupWizard';

interface EnvConfig {
  VITE_N8N_WEBHOOK_URL: string;
  VITE_TELEGRAM_BOT_TOKEN: string;
  VITE_ADMIN_USER_IDS: string;
  VITE_APP_ENV: string;
  VITE_ENABLE_MOCK_MODE: string;
  VITE_LOG_LEVEL: string;
}

const EnvGeneratorWizard: React.FC = () => {
  const { toast } = useToast();
  const [showDetailedSetup, setShowDetailedSetup] = useState(false);
  const [envConfig, setEnvConfig] = useState<EnvConfig>({
    VITE_N8N_WEBHOOK_URL: '',
    VITE_TELEGRAM_BOT_TOKEN: '',
    VITE_ADMIN_USER_IDS: '',
    VITE_APP_ENV: 'production',
    VITE_ENABLE_MOCK_MODE: 'false',
    VITE_LOG_LEVEL: 'info'
  });

  const generateEnvFile = () => {
    const envContent = Object.entries(envConfig)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const blob = new Blob([envContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Файл .env сгенерирован!",
      description: "Загрузите файл на ваш сервер и перезапустите приложение",
    });
  };

  const copyEnvContent = () => {
    const envContent = Object.entries(envConfig)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    navigator.clipboard.writeText(envContent).then(() => {
      toast({
        title: "Скопировано!",
        description: "Environment переменные скопированы в буфер обмена",
      });
    });
  };

  const handleConfigUpdate = (updates: Partial<EnvConfig>) => {
    setEnvConfig(prev => ({ ...prev, ...updates }));
  };

  if (showDetailedSetup) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Детальная настройка</span>
              <Button
                variant="outline"
                onClick={() => setShowDetailedSetup(false)}
              >
                Вернуться к генератору
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SetupWizard />
          </CardContent>
        </Card>
      </div>
    );
  }

  const isConfigured = envConfig.VITE_N8N_WEBHOOK_URL && envConfig.VITE_ADMIN_USER_IDS;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Заголовок */}
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Настройка для администратора
          </h1>
          <p className="text-lg text-muted-foreground">
            Настройте environment переменные для production деплоя
          </p>
        </div>

        {/* Предупреждение */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800">Важно!</h3>
                <p className="text-sm text-amber-700">
                  Эта страница предназначена только для администраторов. 
                  После настройки обычные пользователи будут видеть готовое приложение.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Быстрая генерация или детальная настройка */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Быстрая настройка</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Заполните основные параметры и сгенерируйте .env файл
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">N8N Webhook URL</label>
                  <input
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="https://your-n8n.com/webhook/..."
                    value={envConfig.VITE_N8N_WEBHOOK_URL}
                    onChange={(e) => handleConfigUpdate({ VITE_N8N_WEBHOOK_URL: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Admin User IDs (через запятую)</label>
                  <input
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="123456789,987654321"
                    value={envConfig.VITE_ADMIN_USER_IDS}
                    onChange={(e) => handleConfigUpdate({ VITE_ADMIN_USER_IDS: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={generateEnvFile}
                  disabled={!isConfigured}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Скачать .env</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={copyEnvContent}
                  disabled={!isConfigured}
                  className="flex items-center space-x-2"
                >
                  <Copy className="h-4 w-4" />
                  <span>Копировать</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Детальная настройка</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Пошаговая настройка со всеми инструкциями
              </p>
              
              <Button
                variant="outline"
                onClick={() => setShowDetailedSetup(true)}
                className="w-full"
              >
                Открыть мастер настройки
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Инструкции по деплою */}
        <Card>
          <CardHeader>
            <CardTitle>Инструкции по деплою</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Шаги для production деплоя:</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Сгенерируйте .env файл или скопируйте переменные</li>
                <li>Загрузите .env файл в корень вашего проекта на сервере</li>
                <li>Выполните <code className="bg-gray-200 px-1 rounded">npm run build</code></li>
                <li>Разверните билд на hosting (Vercel, Netlify, и т.д.)</li>
                <li>Настройте Telegram Bot Webhook на ваш домен</li>
              </ol>
            </div>

            {isConfigured && (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Конфигурация готова к деплою</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnvGeneratorWizard;
