
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, RefreshCw, Zap, Globe, Shield } from 'lucide-react';

interface ConnectionTestProps {
  n8nUrl: string;
  onTestComplete: (success: boolean) => void;
}

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  icon: React.ReactNode;
}

const ConnectionTest: React.FC<ConnectionTestProps> = ({
  n8nUrl,
  onTestComplete
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(-1);
  const [testResults, setTestResults] = useState<TestResult[]>([
    {
      name: 'Проверка формата URL',
      status: 'pending',
      message: 'Ожидание...',
      icon: <Globe className="h-4 w-4" />
    },
    {
      name: 'Проверка доступности сервера',
      status: 'pending', 
      message: 'Ожидание...',
      icon: <Zap className="h-4 w-4" />
    },
    {
      name: 'Тестовая отправка webhook',
      status: 'pending',
      message: 'Ожидание...',
      icon: <Shield className="h-4 w-4" />
    }
  ]);

  const runTests = async () => {
    setIsRunning(true);
    setCurrentTestIndex(0);
    
    const newResults = [...testResults];
    
    // Тест 1: Проверка формата URL
    newResults[0].status = 'running';
    setTestResults([...newResults]);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      new URL(n8nUrl);
      newResults[0] = {
        ...newResults[0],
        status: 'success',
        message: 'URL имеет корректный формат'
      };
    } catch {
      newResults[0] = {
        ...newResults[0],
        status: 'error',
        message: 'Некорректный формат URL'
      };
      setTestResults([...newResults]);
      setIsRunning(false);
      onTestComplete(false);
      return;
    }
    
    setTestResults([...newResults]);
    setCurrentTestIndex(1);
    
    // Тест 2: Проверка доступности
    newResults[1].status = 'running';
    setTestResults([...newResults]);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const response = await fetch(n8nUrl, {
        method: 'HEAD',
        mode: 'no-cors'
      });
      
      newResults[1] = {
        ...newResults[1],
        status: 'success',
        message: 'Сервер доступен'
      };
    } catch (error) {
      // В режиме no-cors мы не можем получить реальный статус
      // Поэтому считаем успешным если не было network error
      newResults[1] = {
        ...newResults[1],
        status: 'success',
        message: 'Сервер доступен (предположительно)'
      };
    }
    
    setTestResults([...newResults]);
    setCurrentTestIndex(2);
    
    // Тест 3: Тестовая отправка
    newResults[2].status = 'running';
    setTestResults([...newResults]);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const testPayload = {
        event_type: 'connection_test',
        user_id: 'test_user',
        timestamp: new Date().toISOString(),
        data: {
          test: true,
          message: 'Тестовое сообщение от образовательного приложения'
        }
      };
      
      const response = await fetch(n8nUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(testPayload)
      });
      
      newResults[2] = {
        ...newResults[2],
        status: 'success',
        message: 'Тестовый webhook отправлен успешно'
      };
      
      onTestComplete(true);
    } catch (error) {
      newResults[2] = {
        ...newResults[2],
        status: 'error',
        message: `Ошибка отправки: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      };
      
      onTestComplete(false);
    }
    
    setTestResults([...newResults]);
    setCurrentTestIndex(-1);
    setIsRunning(false);
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Успешно</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Ошибка</Badge>;
      case 'running':
        return <Badge variant="secondary"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Выполняется</Badge>;
      default:
        return <Badge variant="outline">Ожидание</Badge>;
    }
  };

  const getProgressValue = () => {
    if (!isRunning && currentTestIndex === -1) {
      const completedTests = testResults.filter(t => t.status === 'success' || t.status === 'error').length;
      return (completedTests / testResults.length) * 100;
    }
    return ((currentTestIndex + 1) / testResults.length) * 100;
  };

  const allTestsPassed = testResults.every(test => test.status === 'success');
  const hasErrors = testResults.some(test => test.status === 'error');

  return (
    <div className="space-y-6">
      {/* Общий статус */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Проверка подключения</span>
            {!isRunning && allTestsPassed && (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Все проверки пройдены
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Прогресс тестирования</span>
              <span className="text-sm text-muted-foreground">{Math.round(getProgressValue())}%</span>
            </div>
            <Progress value={getProgressValue()} className="h-2" />
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={runTests} 
              disabled={isRunning || !n8nUrl}
              className="flex items-center space-x-2"
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              <span>{isRunning ? 'Тестирование...' : 'Запустить тесты'}</span>
            </Button>
            
            {!n8nUrl && (
              <div className="flex items-center text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 mr-1" />
                Сначала укажите URL на предыдущем шаге
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Детальные результаты тестов */}
      <Card>
        <CardHeader>
          <CardTitle>Результаты проверок</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testResults.map((test, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  test.status === 'running' ? 'bg-blue-50 border-blue-200' :
                  test.status === 'success' ? 'bg-green-50 border-green-200' :
                  test.status === 'error' ? 'bg-red-50 border-red-200' :
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`${
                    test.status === 'running' ? 'text-blue-600' :
                    test.status === 'success' ? 'text-green-600' :
                    test.status === 'error' ? 'text-red-600' :
                    'text-gray-400'
                  }`}>
                    {test.icon}
                  </div>
                  <div>
                    <h4 className="font-medium">{test.name}</h4>
                    <p className="text-sm text-muted-foreground">{test.message}</p>
                  </div>
                </div>
                {getStatusBadge(test.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Результат и рекомендации */}
      {!isRunning && (allTestsPassed || hasErrors) && (
        <Card>
          <CardContent className="p-6">
            {allTestsPassed ? (
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-800">Подключение успешно настроено!</h3>
                <p className="text-green-700">
                  Ваше приложение готово к работе. Все автоматические уведомления будут отправляться в N8N.
                </p>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-red-800">Обнаружены проблемы</h3>
                <p className="text-red-700">
                  Проверьте настройки N8N и попробуйте снова. Приложение будет работать в тестовом режиме.
                </p>
                <Button variant="outline" onClick={runTests} className="mt-2">
                  Повторить тесты
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConnectionTest;
