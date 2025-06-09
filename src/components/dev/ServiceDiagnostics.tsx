
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, RefreshCw, Activity } from 'lucide-react';
import PaymentService from '../../services/PaymentService';
import AutomationManager from '../../services/automation/AutomationManager';
import N8NIntegration from '../../services/automation/N8NIntegration';
import LoggingService from '../../services/LoggingService';

interface ServiceStatus {
  name: string;
  status: 'ok' | 'error' | 'warning';
  message: string;
  details?: any;
}

const ServiceDiagnostics: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const checkServices = async () => {
    setIsChecking(true);
    const results: ServiceStatus[] = [];

    try {
      // Проверка PaymentService
      const paymentService = PaymentService.getInstance();
      results.push({
        name: 'Payment Service',
        status: 'ok',
        message: 'Инициализирован успешно',
        details: { plans: paymentService.getAvailablePlans().length }
      });
    } catch (error) {
      results.push({
        name: 'Payment Service',
        status: 'error',
        message: 'Ошибка инициализации',
        details: error
      });
    }

    try {
      // Проверка AutomationManager
      const automationManager = AutomationManager.getInstance();
      results.push({
        name: 'Automation Manager',
        status: 'ok',
        message: 'Инициализирован успешно'
      });
    } catch (error) {
      results.push({
        name: 'Automation Manager',
        status: 'error',
        message: 'Ошибка инициализации',
        details: error
      });
    }

    try {
      // Проверка N8NIntegration
      const n8nIntegration = N8NIntegration.getInstance();
      const isConfigured = n8nIntegration.isConfigured();
      results.push({
        name: 'N8N Integration',
        status: isConfigured ? 'ok' : 'warning',
        message: isConfigured ? 'Настроен и готов' : 'Не настроен (Mock режим)',
        details: { configured: isConfigured }
      });
    } catch (error) {
      results.push({
        name: 'N8N Integration',
        status: 'error',
        message: 'Ошибка инициализации',
        details: error
      });
    }

    // Проверка Environment Variables
    const envVars = {
      N8N_WEBHOOK_URL: import.meta.env.VITE_N8N_WEBHOOK_URL,
      APP_ENV: import.meta.env.VITE_APP_ENV,
      ENABLE_MOCK_MODE: import.meta.env.VITE_ENABLE_MOCK_MODE
    };

    const missingVars = Object.entries(envVars).filter(([key, value]) => !value).map(([key]) => key);
    
    results.push({
      name: 'Environment Variables',
      status: missingVars.length === 0 ? 'ok' : 'warning',
      message: missingVars.length === 0 ? 'Все переменные настроены' : `Отсутствуют: ${missingVars.join(', ')}`,
      details: envVars
    });

    // Проверка Telegram WebApp
    const telegramAvailable = typeof window !== 'undefined' && !!window.Telegram?.WebApp;
    results.push({
      name: 'Telegram WebApp',
      status: telegramAvailable ? 'ok' : 'warning',
      message: telegramAvailable ? 'Доступен' : 'Недоступен (не в Telegram)',
      details: { available: telegramAvailable }
    });

    setServices(results);
    setIsChecking(false);
  };

  useEffect(() => {
    checkServices();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <Activity className="h-5 w-5 text-yellow-600" />;
      default:
        return <RefreshCw className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ok':
        return <Badge variant="default">OK</Badge>;
      case 'error':
        return <Badge variant="destructive">ERROR</Badge>;
      case 'warning':
        return <Badge variant="secondary">WARNING</Badge>;
      default:
        return <Badge variant="outline">UNKNOWN</Badge>;
    }
  };

  if (import.meta.env.PROD) {
    return null; // Не показываем в production
  }

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Диагностика сервисов
          <Button 
            onClick={checkServices} 
            disabled={isChecking}
            size="sm"
            variant="outline"
          >
            {isChecking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(service.status)}
                <div>
                  <div className="font-medium">{service.name}</div>
                  <div className="text-sm text-muted-foreground">{service.message}</div>
                  {service.details && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {JSON.stringify(service.details, null, 2)}
                    </div>
                  )}
                </div>
              </div>
              {getStatusBadge(service.status)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceDiagnostics;
