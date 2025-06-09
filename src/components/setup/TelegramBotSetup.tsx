
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, CheckCircle2, Bot, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TelegramBotSetupProps {
  onComplete: (token: string, username: string) => void;
  initialData: {
    token: string;
    username: string;
  };
}

const TelegramBotSetup: React.FC<TelegramBotSetupProps> = ({
  onComplete,
  initialData
}) => {
  const { toast } = useToast();
  const [botToken, setBotToken] = useState(initialData.token);
  const [botUsername, setBotUsername] = useState(initialData.username);
  const [isValidated, setIsValidated] = useState(false);

  const botFatherInstructions = [
    {
      step: 1,
      title: "Откройте @BotFather в Telegram",
      description: "Найдите официального бота @BotFather и начните с ним диалог",
      command: "/start"
    },
    {
      step: 2,
      title: "Создайте нового бота",
      description: "Отправьте команду для создания нового бота",
      command: "/newbot"
    },
    {
      step: 3,
      title: "Выберите имя бота",
      description: "Введите любое имя для вашего бота (например: 'Мой Обучающий Бот')",
      command: "Мой Обучающий Бот"
    },
    {
      step: 4,
      title: "Выберите username бота",
      description: "Введите уникальное имя пользователя (должно заканчиваться на 'bot')",
      command: "my_education_bot"
    },
    {
      step: 5,
      title: "Скопируйте токен",
      description: "@BotFather пришлет вам токен. Скопируйте его и вставьте ниже",
      command: ""
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Скопировано!",
      description: "Команда скопирована в буфер обмена",
    });
  };

  const validateBotToken = (token: string) => {
    // Простая валидация формата Telegram Bot Token
    const tokenRegex = /^\d+:[A-Za-z0-9_-]{35}$/;
    return tokenRegex.test(token);
  };

  const handleTokenChange = (value: string) => {
    setBotToken(value);
    const isValid = validateBotToken(value) && botUsername.length > 0;
    setIsValidated(isValid);
    
    if (isValid) {
      onComplete(value, botUsername);
    }
  };

  const handleUsernameChange = (value: string) => {
    setBotUsername(value);
    const isValid = validateBotToken(botToken) && value.length > 0;
    setIsValidated(isValid);
    
    if (isValid) {
      onComplete(botToken, value);
    }
  };

  const openBotFather = () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink('https://t.me/BotFather');
    } else {
      window.open('https://t.me/BotFather', '_blank');
    }
  };

  useEffect(() => {
    if (initialData.token && initialData.username) {
      setIsValidated(validateBotToken(initialData.token));
    }
  }, [initialData]);

  return (
    <div className="space-y-6">
      {/* Инструкции по созданию бота */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-2 mb-3">
          <Bot className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-800">Пошаговая инструкция</h3>
        </div>
        <div className="space-y-3">
          {botFatherInstructions.map((instruction, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                {instruction.step}
              </div>
              <div className="flex-1">
                <p className="font-medium text-blue-800">{instruction.title}</p>
                <p className="text-sm text-blue-600 mb-2">{instruction.description}</p>
                {instruction.command && (
                  <div className="flex items-center space-x-2">
                    <code className="bg-white px-2 py-1 rounded text-sm border">
                      {instruction.command}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(instruction.command)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <Button
          onClick={openBotFather}
          className="w-full mt-4 flex items-center space-x-2"
          variant="default"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Открыть @BotFather</span>
        </Button>
      </div>

      {/* Форма ввода данных бота */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <span>Данные вашего бота</span>
            {isValidated && (
              <Badge variant="default" className="ml-auto">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Настроено
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bot-token">Токен бота</Label>
            <Input
              id="bot-token"
              type="password"
              value={botToken}
              onChange={(e) => handleTokenChange(e.target.value)}
              placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
              className={`${
                botToken && !validateBotToken(botToken) 
                  ? 'border-red-500 focus:border-red-500' 
                  : ''
              }`}
            />
            {botToken && !validateBotToken(botToken) && (
              <div className="flex items-center space-x-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Неверный формат токена</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Токен должен быть в формате: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bot-username">Username бота</Label>
            <Input
              id="bot-username"
              value={botUsername}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder="my_education_bot"
            />
            <p className="text-xs text-muted-foreground">
              Имя пользователя бота без символа @ (например: my_education_bot)
            </p>
          </div>

          {isValidated && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Бот успешно настроен!</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Дополнительные настройки */}
      <Card>
        <CardHeader>
          <CardTitle>Дополнительные настройки (необязательно)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            После создания бота рекомендуется настроить дополнительные параметры через @BotFather:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center space-x-2">
              <span>•</span>
              <span><code>/setdescription</code> - описание бота</span>
            </li>
            <li className="flex items-center space-x-2">
              <span>•</span>
              <span><code>/setuserpic</code> - аватарка бота</span>
            </li>
            <li className="flex items-center space-x-2">
              <span>•</span>
              <span><code>/setcommands</code> - команды бота</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default TelegramBotSetup;
