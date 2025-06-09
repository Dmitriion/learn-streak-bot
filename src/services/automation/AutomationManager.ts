
import N8NIntegration from './N8NIntegration';
import { N8NWebhookEvent } from '../../types/automation';
import { TelegramUser } from '../auth/types';
import LoggingService from '../LoggingService';
import FallbackManager from '../fallback/FallbackManager';
import EnvironmentManager from '../environment/EnvironmentManager';
import HealthCheckService from '../health/HealthCheckService';

class AutomationManager {
  private static instance: AutomationManager;
  private n8nIntegration: N8NIntegration;
  private logger: LoggingService;
  private fallbackManager: FallbackManager;
  private environmentManager: EnvironmentManager;
  private healthCheckService: HealthCheckService;

  constructor() {
    this.n8nIntegration = N8NIntegration.getInstance();
    this.logger = LoggingService.getInstance();
    this.fallbackManager = FallbackManager.getInstance();
    this.environmentManager = EnvironmentManager.getInstance();
    this.healthCheckService = HealthCheckService.getInstance();
    
    this.setupHealthChecks();
  }

  static getInstance(): AutomationManager {
    if (!AutomationManager.instance) {
      AutomationManager.instance = new AutomationManager();
    }
    return AutomationManager.instance;
  }

  private setupHealthChecks() {
    // Регистрируем health check для N8N
    this.healthCheckService.registerService('n8n', async () => {
      try {
        const result = await this.n8nIntegration.testConnection();
        return {
          healthy: result.success,
          error: result.error
        };
      } catch (error) {
        return {
          healthy: false,
          error: error.message
        };
      }
    });
  }

  // Методы для триггеров событий обучения с улучшенным fallback
  async onUserRegistered(user: TelegramUser, fullName: string) {
    const event: N8NWebhookEvent = {
      event_type: 'user_registered',
      user_id: user.id.toString(),
      timestamp: new Date().toISOString(),
      data: {
        full_name: fullName,
        registration_source: 'telegram_webapp'
      },
      telegram_data: {
        user_id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name
      }
    };

    await this.fallbackManager.executeWithFallback(
      'user_registration',
      () => this.n8nIntegration.triggerWebhook(event),
      {
        strategy: 'graceful-degradation',
        config: { maxRetries: 2, timeout: 8000 },
        fallbackFunction: async () => {
          this.logger.info('AutomationManager: N8N недоступен, события сохранены локально');
          return true;
        }
      }
    );
  }

  async onLessonCompleted(userId: string, lessonId: number, score?: number) {
    const event: N8NWebhookEvent = {
      event_type: 'lesson_completed',
      user_id: userId,
      timestamp: new Date().toISOString(),
      data: {
        lesson_id: lessonId,
        score: score || 0,
        completion_time: new Date().toISOString()
      }
    };

    await this.fallbackManager.executeWithFallback(
      'lesson_completion',
      () => this.n8nIntegration.triggerWebhook(event),
      {
        strategy: 'circuit-breaker',
        config: { maxRetries: 3, circuitBreakerThreshold: 5 }
      }
    );
  }

  async onTestPassed(userId: string, lessonId: number, score: number, totalQuestions: number) {
    const event: N8NWebhookEvent = {
      event_type: 'test_passed',
      user_id: userId,
      timestamp: new Date().toISOString(),
      data: {
        lesson_id: lessonId,
        score,
        total_questions: totalQuestions,
        percentage: Math.round((score / totalQuestions) * 100),
        passed: score >= Math.ceil(totalQuestions * 0.7) // 70% для прохождения
      }
    };

    await this.fallbackManager.executeWithFallback(
      'test_completion',
      () => this.n8nIntegration.triggerWebhook(event),
      {
        strategy: 'retry',
        config: { maxRetries: 2, timeout: 5000 }
      }
    );
  }

  async onPaymentSuccess(userId: string, planId: string, amount: number) {
    const event: N8NWebhookEvent = {
      event_type: 'payment_success',
      user_id: userId,
      timestamp: new Date().toISOString(),
      data: {
        plan_id: planId,
        amount,
        currency: 'RUB',
        payment_method: 'telegram_payments'
      }
    };

    // Платежи критически важны - используем более агрессивную стратегию
    await this.fallbackManager.executeWithFallback(
      'payment_processing',
      () => this.n8nIntegration.triggerWebhook(event),
      {
        strategy: 'retry',
        config: { maxRetries: 5, timeout: 10000 }
      }
    );
  }

  async onCourseCompleted(userId: string, totalLessons: number, finalScore: number) {
    const event: N8NWebhookEvent = {
      event_type: 'course_completed',
      user_id: userId,
      timestamp: new Date().toISOString(),
      data: {
        total_lessons: totalLessons,
        final_score: finalScore,
        completion_date: new Date().toISOString(),
        certificate_eligible: finalScore >= 70
      }
    };

    await this.fallbackManager.executeWithFallback(
      'course_completion',
      () => this.n8nIntegration.triggerWebhook(event),
      {
        strategy: 'graceful-degradation',
        config: { maxRetries: 3 },
        fallbackFunction: async () => {
          this.logger.info('AutomationManager: сохраняем completion локально для последующей отправки');
          return true;
        }
      }
    );
  }

  async onUserInactive(userId: string, daysSinceLastActivity: number) {
    const event: N8NWebhookEvent = {
      event_type: 'user_inactive',
      user_id: userId,
      timestamp: new Date().toISOString(),
      data: {
        days_inactive: daysSinceLastActivity,
        last_activity: new Date(Date.now() - daysSinceLastActivity * 24 * 60 * 60 * 1000).toISOString()
      }
    };

    await this.fallbackManager.executeWithFallback(
      'user_activity_tracking',
      () => this.n8nIntegration.triggerWebhook(event),
      {
        strategy: 'circuit-breaker',
        config: { maxRetries: 1, circuitBreakerThreshold: 3 }
      }
    );
  }

  // Методы конфигурации
  setN8NWebhookUrl(baseUrl: string) {
    this.n8nIntegration.updateConfig({ base_webhook_url: baseUrl });
    this.logger.info('N8N webhook URL обновлен', { baseUrl });
  }

  getEnabledTriggers() {
    return this.n8nIntegration.getEnabledTriggers();
  }

  toggleTrigger(triggerId: string, enabled: boolean) {
    this.n8nIntegration.toggleTrigger(triggerId, enabled);
  }

  async testConnection(): Promise<boolean> {
    try {
      const result = await this.fallbackManager.executeWithFallback(
        'n8n_connection_test',
        () => this.n8nIntegration.testConnection(),
        {
          strategy: 'immediate',
          config: { timeout: 5000 }
        }
      );
      return result.success;
    } catch (error) {
      this.logger.error('Ошибка тестирования подключения N8N', { error });
      return false;
    }
  }

  getHealthStatus(): { healthy: boolean; details: any } {
    try {
      const isConfigured = this.n8nIntegration.isConfigured();
      const enabledTriggersCount = this.getEnabledTriggers().length;
      const n8nHealth = this.healthCheckService.getServiceHealth('n8n');
      const fallbackStatus = this.fallbackManager.getCircuitBreakerStatus('n8n_connection_test');
      
      return {
        healthy: isConfigured && enabledTriggersCount > 0 && n8nHealth?.status !== 'unhealthy',
        details: {
          configured: isConfigured,
          enabledTriggers: enabledTriggersCount,
          webhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL || 'не задан',
          n8nHealth: n8nHealth?.status || 'unknown',
          environment: this.environmentManager.getMode(),
          fallbackActive: fallbackStatus?.state === 'open',
          circuitBreakerFailures: fallbackStatus?.failures || 0
        }
      };
    } catch (error) {
      return {
        healthy: false,
        details: { error: error.message }
      };
    }
  }

  // Новые методы для управления системой
  async getDetailedStatus() {
    const overallHealth = this.healthCheckService.getOverallHealth();
    const allHealthStatuses = this.healthCheckService.getAllHealthStatus();
    
    return {
      overall: overallHealth,
      services: Object.fromEntries(allHealthStatuses),
      environment: this.environmentManager.getMode(),
      mockMode: this.environmentManager.shouldUseMockData(),
      fallbacksEnabled: this.environmentManager.shouldEnableFallbacks()
    };
  }

  resetCircuitBreakers() {
    this.fallbackManager.resetCircuitBreaker('user_registration');
    this.fallbackManager.resetCircuitBreaker('lesson_completion');
    this.fallbackManager.resetCircuitBreaker('test_completion');
    this.fallbackManager.resetCircuitBreaker('payment_processing');
    this.fallbackManager.resetCircuitBreaker('course_completion');
    this.fallbackManager.resetCircuitBreaker('user_activity_tracking');
    this.fallbackManager.resetCircuitBreaker('n8n_connection_test');
    
    this.logger.info('AutomationManager: все circuit breakers сброшены');
  }
}

export default AutomationManager;
