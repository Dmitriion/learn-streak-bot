
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Download, CheckCircle2, AlertCircle, Zap, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TelegramValidationService from '../../services/TelegramValidationService';

interface N8NSetupProps {
  onUrlChange: (url: string) => void;
  initialUrl: string;
}

const N8NSetup: React.FC<N8NSetupProps> = ({
  onUrlChange,
  initialUrl
}) => {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState(initialUrl);
  const [selectedOption, setSelectedOption] = useState<'n8n' | 'zapier' | 'email'>('n8n');
  const [zapierUrl, setZapierUrl] = useState('');
  const [emailConfig, setEmailConfig] = useState({
    smtp_host: '',
    smtp_port: '587',
    username: '',
    password: ''
  });

  const validationService = TelegramValidationService.getInstance();

  const validateUrl = (url: string) => {
    if (!url) return { isValid: false, error: '' };
    return validationService.validateWebhookUrl(url);
  };

  const handleUrlChange = (url: string) => {
    setWebhookUrl(url);
    onUrlChange(url);
  };

  const downloadN8NTemplate = () => {
    const template = {
      name: "Education App Automation",
      nodes: [
        {
          name: "Webhook",
          type: "n8n-nodes-base.webhook",
          position: [250, 300],
          parameters: {
            path: "education-app",
            options: {}
          }
        },
        {
          name: "Switch",
          type: "n8n-nodes-base.switch",
          position: [450, 300],
          parameters: {
            rules: {
              rules: [
                {
                  operation: "equal",
                  value1: "={{$json.event_type}}",
                  value2: "user_registered"
                },
                {
                  operation: "equal", 
                  value1: "={{$json.event_type}}",
                  value2: "lesson_completed"
                }
              ]
            }
          }
        }
      ],
      connections: {}
    };
    
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'education-app-n8n-template.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Шаблон скачан!",
      description: "Импортируйте файл в ваш N8N instance",
    });
  };

  const urlValidation = validateUrl(webhookUrl);

  return (
    <div className="space-y-6">
      {/* Выбор типа автоматизации */}
      <Tabs value={selectedOption} onValueChange={(value) => setSelectedOption(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="n8n" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>N8N</span>
          </TabsTrigger>
          <TabsTrigger value="zapier" className="flex items-center space-x-2">
            <ExternalLink className="h-4 w-4" />
            <span>Zapier</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>Email</span>
          </TabsTrigger>
        </TabsList>

        {/* N8N настройка */}
        <TabsContent value="n8n">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-blue-600" />
                <span>Настройка N8N</span>
                {webhookUrl && urlValidation.isValid && (
                  <Badge variant="default">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Настроено
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Что такое N8N?</h4>
                <p className="text-sm text-blue-700 mb-3">
                  N8N - это платформа для автоматизации, которая позволяет настроить автоматические действия 
                  при различных событиях в вашем приложении (регистрация, завершение урока, оплата и т.д.)
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadN8NTemplate}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Скачать готовый шаблон</span>
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="n8n-url">URL вашего N8N webhook</Label>
                <Input
                  id="n8n-url"
                  value={webhookUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://your-n8n-instance.com/webhook/education-app"
                  className={`${
                    webhookUrl && !urlValidation.isValid 
                      ? 'border-red-500 focus:border-red-500' 
                      : ''
                  }`}
                />
                {webhookUrl && !urlValidation.isValid && (
                  <div className="flex items-center space-x-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{urlValidation.error}</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Получите этот URL после создания webhook в N8N
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">Пошаговая инструкция:</h4>
                <ol className="text-sm text-yellow-700 space-y-1">
                  <li>1. Зарегистрируйтесь на n8n.io или установите N8N локально</li>
                  <li>2. Создайте новый workflow</li>
                  <li>3. Добавьте webhook trigger</li>
                  <li>4. Скопируйте URL webhook и вставьте выше</li>
                  <li>5. Импортируйте наш готовый шаблон</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Zapier настройка */}
        <TabsContent value="zapier">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ExternalLink className="h-5 w-5 text-orange-600" />
                <span>Настройка Zapier</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-800 mb-2">Альтернатива N8N</h4>
                <p className="text-sm text-orange-700 mb-3">
                  Zapier - более простая альтернатива N8N с готовыми интеграциями. 
                  Подходит если вы не хотите разбираться с N8N.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zapier-url">Zapier Webhook URL</Label>
                <Input
                  id="zapier-url"
                  value={zapierUrl}
                  onChange={(e) => {
                    setZapierUrl(e.target.value);
                    onUrlChange(e.target.value);
                  }}
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                />
                <p className="text-xs text-muted-foreground">
                  Создайте Zap с Webhook триггером и вставьте URL сюда
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Как настроить:</h4>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Зайдите на zapier.com</li>
                  <li>2. Создайте новый Zap</li>
                  <li>3. Выберите "Webhooks by Zapier" как триггер</li>
                  <li>4. Выберите "Catch Hook"</li>
                  <li>5. Скопируйте предоставленный URL</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email настройка */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-green-600" />
                <span>Email уведомления</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Простое решение</h4>
                <p className="text-sm text-green-700">
                  Если вам нужны только email уведомления, используйте встроенный SMTP сервис.
                  Просто укажите настройки вашей почты.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SMTP Сервер</Label>
                  <Input
                    value={emailConfig.smtp_host}
                    onChange={(e) => setEmailConfig(prev => ({...prev, smtp_host: e.target.value}))}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Порт</Label>
                  <Input
                    value={emailConfig.smtp_port}
                    onChange={(e) => setEmailConfig(prev => ({...prev, smtp_port: e.target.value}))}
                    placeholder="587"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={emailConfig.username}
                    onChange={(e) => setEmailConfig(prev => ({...prev, username: e.target.value}))}
                    placeholder="your-email@gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Пароль</Label>
                  <Input
                    type="password"
                    value={emailConfig.password}
                    onChange={(e) => setEmailConfig(prev => ({...prev, password: e.target.value}))}
                    placeholder="app-password"
                  />
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>Для Gmail:</strong> Используйте "Пароли приложений" вместо обычного пароля.
                  Включите двухфакторную аутентификацию и создайте пароль приложения.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Информация о том, что будет автоматизировано */}
      <Card>
        <CardHeader>
          <CardTitle>Что будет автоматизировано?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Действия пользователей:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Регистрация нового пользователя</li>
                <li>• Завершение урока</li>
                <li>• Прохождение теста</li>
                <li>• Завершение курса</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Автоматические действия:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Отправка приветственного сообщения</li>
                <li>• Уведомления о прогрессе</li>
                <li>• Напоминания о неактивности</li>
                <li>• Выдача сертификатов</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default N8NSetup;
