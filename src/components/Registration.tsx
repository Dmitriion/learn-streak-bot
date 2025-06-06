
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { UserPlus, Loader2 } from 'lucide-react';
import { useTelegram } from '../providers/TelegramProvider';

interface RegistrationProps {
  onRegistrationComplete: (fullName: string) => void;
  isLoading?: boolean;
  error?: string;
}

const Registration: React.FC<RegistrationProps> = ({ 
  onRegistrationComplete, 
  isLoading = false, 
  error 
}) => {
  const { user, showMainButton, hideMainButton, hapticFeedback } = useTelegram();
  const [fullName, setFullName] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Предзаполняем имя из Telegram данных
    if (user) {
      const telegramName = `${user.first_name} ${user.last_name || ''}`.trim();
      setFullName(telegramName);
    }
  }, [user]);

  useEffect(() => {
    // Валидация формы
    const valid = fullName.trim().length >= 2;
    setIsValid(valid);

    if (valid && !isLoading) {
      showMainButton('Зарегистрироваться', handleRegistration);
    } else {
      hideMainButton();
    }

    return () => hideMainButton();
  }, [fullName, isLoading, showMainButton, hideMainButton]);

  const handleRegistration = () => {
    if (isValid && !isLoading) {
      hapticFeedback('medium');
      onRegistrationComplete(fullName.trim());
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRegistration();
  };

  return (
    <div className="p-4 space-y-6 min-h-screen flex flex-col justify-center">
      <div className="text-center space-y-3">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <UserPlus className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Добро пожаловать!
        </h1>
        <p className="text-muted-foreground text-sm">
          Давайте настроим ваш профиль для начала обучения
        </p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-center">Регистрация</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Ваше полное имя</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Введите ваше имя и фамилию"
                disabled={isLoading}
                className="text-base"
              />
              <p className="text-xs text-muted-foreground">
                Это имя будет отображаться в вашем профиле
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Регистрируем...
                </>
              ) : (
                'Зарегистрироваться'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-muted-foreground">
        Регистрируясь, вы соглашаетесь с условиями использования платформы
      </div>
    </div>
  );
};

export default Registration;
