
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, Shield, Zap } from 'lucide-react';
import PaymentService from '../../services/PaymentService';
import AutomationManager from '../../services/automation/AutomationManager';
import BuildValidator from '../../services/BuildValidator';
import LoggingService from '../../services/LoggingService';

interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  critical: boolean;
}

const ProductionHealthCheck: React.FC = () => {
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  const logger = LoggingService.getInstance();

  const runHealthChecks = async () => {
    setIsChecking(true);
    const healthChecks: HealthCheck[] = [];

    try {
      // 1. Telegram WebApp API
      const telegramAvailable = typeof window !== 'undefined' && !!window.Telegram?.WebApp;
      healthChecks.push({
        name: 'Telegram WebApp API',
        status: telegramAvailable ? 'pass' : 'fail',
        message: telegramAvailable ? 'API доступен и готов' : 'API недоступен',
        critical: true
      });

      // 2. Payment Service
      const paymentService = PaymentService.getInstance();
      const paymentHealth = paymentService.getServiceHealth();
      healthChecks.push({
        name: 'Payment Service',
        status: paymentHealth.healthy ? 'pass' : 'warning',
        message: paymentHealth.healthy ? 
          `Работает (${paymentHealth.details.availableProviders} провайдера)` : 
          'Провайдеры не настроены',
        critical: false
      });

      // 3. Automation Manager  
      const automationManager = AutomationManager.getInstance();
      const automationHealth = automationManager.getHealthStatus();
      const connectionTest = await automationManager.testConnection();
      
      healthChecks.push({
        name: 'N8N Automation',
        status: automationHealth.healthy && connectionTest ? 'pass' : 'warning',
        message: automationHealth.healthy && connectionTest ? 
          'Подключен и работает' : 
          'Не настроен или недоступен',
        critical: false
      });

      // 4. Build Validation
      const buildValidator = BuildValidator.getInstance();
      const buildValidation = buildValidator.validateProductionBuild();
      
      healthChecks.push({
        name: 'Production Build',
        status: buildValidation.isValid ? 'pass' : 'warning',
        message: buildValidation.isValid ? 
          'Готов к деплою' : 
          `Проблемы: ${buildValidation.errors.join(', ')}`,
        critical: true
      });

      // 5. HTTPS Protocol
      const isHttps = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      healthChecks.push({
        name: 'HTTPS Protocol',
        status: isHttps ? 'pass' : 'fail',
        message: isHttps ? 'Безопасное соединение' : 'Требуется HTTPS',
        critical: true
      });

      // 6. Environment Variables
      const envVars = {
        N8N_WEBHOOK: !!import.meta.env.VITE_N8N_WEBHOOK_URL,
        YOUKASSA_SHOP_ID: !!import.meta.env.VITE_YOUKASSA_SHOP_ID,
        YOUKASSA_SECRET: !!import.meta.env.VITE_YOUKASSA_SECRET_KEY
      };
      
      const configuredVars = Object.values(envVars).filter(Boolean).length;
      const totalVars = Object.keys(envVars).length;
      
      healthChecks.push({
        name: 'Environment Config',
        status: configuredVars >= totalVars * 0.7 ? 'pass' : 'warning',
        message: `${configuredVars}/${totalVars} переменных настроено`,
        critical: false
      });

      // 7. Error Handling
      const errorServiceWorks = !!logger && typeof logger.error === 'function';
      healthChecks.push({
        name: 'Error Handling',
        status: errorServiceWorks ? 'pass' : 'fail',
        message: errorServiceWorks ? 'Система логирования работает' : 'Проблемы с логированием',
        critical: true
      });

      setChecks(healthChecks);

      // Подсчет общего балла
      const criticalChecks = healthChecks.filter(c => c.critical);
      const passedCritical = criticalChecks.filter(c => c.status === 'pass').length;
      const totalPassed = healthChecks.filter(c => c.status === 'pass').length;
      
      // Критические проверки весят больше
      const score = Math.round(
        (passedCritical / criticalChecks.length * 0.7 + 
         totalPassed / healthChecks.length * 0.3) * 100
      );
      
      setOverallScore(score);

      logger.info('Production health check завершен', {
        score,
        totalChecks: healthChecks.length,
        passed: totalPassed,
        critical: criticalChecks.length,
        passedCritical
      });

    } catch (error) {
      logger.error('Ошибка health check', { error });
      healthChecks.push({
        name: 'Health Check System',
        status: 'fail',
        message: 'Ошибка проведения проверки',
        critical: true
      });
      setChecks(healthChecks);
      setOverallScore(0);
    }

    setIsChecking(false);
  };

  useEffect(() => {
    runHealthChecks();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800 border-green-200">PASS</Badge>;
      case 'fail':
        return <Badge variant="destructive">FAIL</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">WARNING</Badge>;
      default:
        return <Badge variant="outline">UNKNOWN</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReadinessMessage = (score: number) => {
    if (score >= 95) return 'Готов к production deployment';
    if (score >= 85) return 'Почти готов, мелкие доработки';
    if (score >= 70) return 'Требуются исправления';
    return 'Не готов к production';
  };

  if (import.meta.env.PROD) {
    return null; // Не показываем в production
  }

  return (
    <Card className="m-4 border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Production Health Check
          <div className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
            {overallScore}%
          </div>
          <Button 
            onClick={runHealthChecks} 
            disabled={isChecking}
            size="sm"
            variant="outline"
          >
            <Zap className="h-4 w-4" />
            {isChecking ? 'Проверка...' : 'Перепроверить'}
          </Button>
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          {getReadinessMessage(overallScore)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {checks.map((check, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(check.status)}
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {check.name}
                    {check.critical && (
                      <Badge variant="outline" className="text-xs">CRITICAL</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{check.message}</div>
                </div>
              </div>
              {getStatusBadge(check.status)}
            </div>
          ))}
        </div>

        {overallScore >= 95 && (
          <div className="mt-6 p-4 bg-green-50 border-green-200 border rounded-lg">
            <div className="flex items-center gap-2 text-green-800 font-medium">
              <CheckCircle className="h-5 w-5" />
              Приложение готово к production deployment!
            </div>
            <div className="text-sm text-green-700 mt-1">
              Все критические проверки пройдены. Можно безопасно деплоить в Telegram.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductionHealthCheck;
