
import { useState } from 'react';
import PaymentService from '../services/PaymentService';
import AutomationManager from '../services/automation/AutomationManager';
import BuildValidator from '../services/BuildValidator';
import LoggingService from '../services/LoggingService';

interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  critical: boolean;
}

export const useHealthChecks = () => {
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
      const automationHealth = await automationManager.getHealthStatus();
      const connectionTest = await automationManager.testConnection();
      
      healthChecks.push({
        name: 'N8N Automation',
        status: automationHealth.isHealthy && connectionTest ? 'pass' : 'warning',
        message: automationHealth.isHealthy && connectionTest ? 
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

  return {
    checks,
    overallScore,
    isChecking,
    runHealthChecks
  };
};
