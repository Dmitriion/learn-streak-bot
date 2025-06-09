
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, ArrowLeft, ArrowRight, Rocket } from 'lucide-react';
import TelegramBotSetup from './TelegramBotSetup';
import N8NSetup from './N8NSetup';
import ConnectionTest from './ConnectionTest';
import SetupComplete from './SetupComplete';
import { useTelegram } from '../../providers/TelegramProvider';

export type SetupStep = 'telegram' | 'n8n' | 'test' | 'complete';

interface SetupState {
  telegramBotToken: string;
  telegramBotUsername: string;
  n8nWebhookUrl: string;
  isN8NTested: boolean;
  isTelegramConfigured: boolean;
}

const SetupWizard = () => {
  const { hapticFeedback } = useTelegram();
  const [currentStep, setCurrentStep] = useState<SetupStep>('telegram');
  const [setupState, setSetupState] = useState<SetupState>({
    telegramBotToken: '',
    telegramBotUsername: '',
    n8nWebhookUrl: '',
    isN8NTested: false,
    isTelegramConfigured: false
  });

  const steps = [
    { id: 'telegram', title: 'Создание Telegram бота', icon: '🤖' },
    { id: 'n8n', title: 'Настройка автоматизации', icon: '⚡' },
    { id: 'test', title: 'Проверка подключения', icon: '🔍' },
    { id: 'complete', title: 'Готово к запуску', icon: '🚀' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const canGoNext = () => {
    switch (currentStep) {
      case 'telegram':
        return setupState.isTelegramConfigured;
      case 'n8n':
        return setupState.n8nWebhookUrl.length > 0;
      case 'test':
        return setupState.isN8NTested;
      default:
        return false;
    }
  };

  const handleNext = () => {
    hapticFeedback('light');
    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < steps.length) {
      setCurrentStep(steps[nextStepIndex].id as SetupStep);
    }
  };

  const handlePrevious = () => {
    hapticFeedback('light');
    const prevStepIndex = currentStepIndex - 1;
    if (prevStepIndex >= 0) {
      setCurrentStep(steps[prevStepIndex].id as SetupStep);
    }
  };

  const updateSetupState = (updates: Partial<SetupState>) => {
    setSetupState(prev => ({ ...prev, ...updates }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'telegram':
        return (
          <TelegramBotSetup
            onComplete={(token, username) => {
              updateSetupState({
                telegramBotToken: token,
                telegramBotUsername: username,
                isTelegramConfigured: true
              });
            }}
            initialData={{
              token: setupState.telegramBotToken,
              username: setupState.telegramBotUsername
            }}
          />
        );
      case 'n8n':
        return (
          <N8NSetup
            onUrlChange={(url) => updateSetupState({ n8nWebhookUrl: url })}
            initialUrl={setupState.n8nWebhookUrl}
          />
        );
      case 'test':
        return (
          <ConnectionTest
            n8nUrl={setupState.n8nWebhookUrl}
            onTestComplete={(success) => updateSetupState({ isN8NTested: success })}
          />
        );
      case 'complete':
        return <SetupComplete setupState={setupState} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок мастера */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Rocket className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Мастер быстрой настройки
          </h1>
          <p className="text-lg text-muted-foreground">
            Настроим ваше приложение за несколько простых шагов
          </p>
        </div>

        {/* Индикатор прогресса */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center space-x-2 ${
                    index <= currentStepIndex ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    index < currentStepIndex
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : index === currentStepIndex
                      ? 'border-blue-600 text-blue-600'
                      : 'border-gray-300 text-gray-400'
                  }`}>
                    {index < currentStepIndex ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className="hidden md:block font-medium">{step.title}</span>
                </div>
              ))}
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Шаг {currentStepIndex + 1} из {steps.length}: {steps[currentStepIndex].title}
            </p>
          </CardContent>
        </Card>

        {/* Контент текущего шага */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-2xl">{steps[currentStepIndex].icon}</span>
              <span>{steps[currentStepIndex].title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Навигация */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Назад</span>
          </Button>

          {currentStep !== 'complete' ? (
            <Button
              onClick={handleNext}
              disabled={!canGoNext()}
              className="flex items-center space-x-2"
            >
              <span>Далее</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => window.location.reload()}
              className="flex items-center space-x-2"
            >
              <Rocket className="h-4 w-4" />
              <span>Запустить приложение</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
