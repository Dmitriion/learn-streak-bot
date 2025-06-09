
import LoggingService from '../LoggingService';
import N8NIntegration from './N8NIntegration';
import EnvironmentManager from '../environment/EnvironmentManager';
import { AutomationEvent, AutomationTrigger } from '../../types/automation';
import { AutomationHealthDetails } from '../../types/metrics';
import { TelegramUser } from '../auth/types';

class AutomationManager {
  private static instance: AutomationManager;
  private logger: LoggingService;
  private n8nIntegration: N8NIntegration;
  private environmentManager: EnvironmentManager;
  private isEnabled: boolean = true;
  private webhookUrl: string = '';

  constructor() {
    this.logger = LoggingService.getInstance();
    this.n8nIntegration = N8NIntegration.getInstance();
    this.environmentManager = EnvironmentManager.getInstance();
    this.initializeWebhookUrl();
  }

  static getInstance(): AutomationManager {
    if (!AutomationManager.instance) {
      AutomationManager.instance = new AutomationManager();
    }
    return AutomationManager.instance;
  }

  private initializeWebhookUrl() {
    const savedUrl = localStorage.getItem('n8n_webhook_url');
    if (savedUrl) {
      this.webhookUrl = savedUrl;
      this.n8nIntegration.setWebhookUrl(savedUrl);
    }
  }

  setN8NWebhookUrl(url: string) {
    this.webhookUrl = url;
    this.n8nIntegration.setWebhookUrl(url);
    localStorage.setItem('n8n_webhook_url', url);
    this.logger.info('N8N webhook URL обновлен', { url });
  }

  enable() {
    this.isEnabled = true;
    this.logger.info('AutomationManager включен');
  }

  disable() {
    this.isEnabled = false;
    this.logger.info('AutomationManager отключен');
  }

  async triggerEvent(event: AutomationEvent) {
    if (!this.isEnabled) {
      this.logger.debug('AutomationManager отключен, событие пропущено', { event: event.type });
      return;
    }

    if (!this.webhookUrl) {
      this.logger.warn('N8N webhook URL не настроен', { event: event.type });
      return;
    }

    try {
      this.logger.info('Отправка события в N8N', { event: event.type, userId: event.user_id });
      await this.n8nIntegration.sendEvent(event);
    } catch (error) {
      this.logger.error('Ошибка отправки события в N8N', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        event: event.type 
      });
    }
  }

  async getHealthStatus(): Promise<{ 
    isHealthy: boolean; 
    details: AutomationHealthDetails;
  }> {
    if (!this.webhookUrl) {
      return {
        isHealthy: false,
        details: {
          webhookUrl: '',
          lastSuccessfulCall: null,
          lastError: 'Webhook URL не настроен',
          responseTime: 0,
          status: 'unhealthy',
          retryCount: 0
        }
      };
    }

    try {
      const connectionTest = await this.n8nIntegration.testConnection();
      return {
        isHealthy: connectionTest.success,
        details: {
          webhookUrl: this.webhookUrl,
          lastSuccessfulCall: connectionTest.success ? new Date().toISOString() : null,
          lastError: connectionTest.error || null,
          responseTime: 0,
          status: connectionTest.success ? 'healthy' : 'unhealthy',
          retryCount: 0
        }
      };
    } catch (error) {
      return {
        isHealthy: false,
        details: {
          webhookUrl: this.webhookUrl,
          lastSuccessfulCall: null,
          lastError: error instanceof Error ? error.message : 'Unknown error',
          responseTime: 0,
          status: 'unhealthy',
          retryCount: 0
        }
      };
    }
  }

  getConfiguration() {
    return {
      webhookUrl: this.webhookUrl,
      enabled_triggers: this.n8nIntegration.getEnabledTriggers(),
      retry_settings: {
        max_retries: 3,
        retry_delay: 1000
      }
    };
  }

  // Методы для совместимости с хуками и сервисами
  getEnabledTriggers(): AutomationTrigger[] {
    return this.n8nIntegration.getEnabledTriggers();
  }

  toggleTrigger(triggerId: string, enabled: boolean) {
    this.n8nIntegration.toggleTrigger(triggerId, enabled);
  }

  async testConnection(): Promise<boolean> {
    const result = await this.n8nIntegration.testConnection();
    return result.success;
  }

  // Методы для автоматизации образовательных событий
  async onUserRegistered(telegramUser: TelegramUser, fullName: string): Promise<void> {
    await this.triggerEvent({
      type: 'user_registered',
      user_id: telegramUser.id.toString(),
      timestamp: new Date().toISOString(),
      data: { fullName },
      telegram_data: telegramUser
    });
  }

  async onLessonCompleted(userId: string, lessonId: number, score?: number): Promise<void> {
    await this.triggerEvent({
      type: 'lesson_completed',
      user_id: userId,
      timestamp: new Date().toISOString(),
      data: { lessonId, score }
    });
  }

  async onTestPassed(userId: string, lessonId: number, score: number, totalQuestions: number): Promise<void> {
    await this.triggerEvent({
      type: 'test_passed',
      user_id: userId,
      timestamp: new Date().toISOString(),
      data: { lessonId, score, totalQuestions }
    });
  }

  async onPaymentSuccess(userId: string, planId: string, amount: number): Promise<void> {
    await this.triggerEvent({
      type: 'payment_success',
      user_id: userId,
      timestamp: new Date().toISOString(),
      data: { planId, amount }
    });
  }

  async onCourseCompleted(userId: string, totalLessons: number, finalScore: number): Promise<void> {
    await this.triggerEvent({
      type: 'course_completed',
      user_id: userId,
      timestamp: new Date().toISOString(),
      data: { totalLessons, finalScore }
    });
  }

  async onUserInactive(userId: string, daysSinceLastActivity: number): Promise<void> {
    await this.triggerEvent({
      type: 'user_inactive',
      user_id: userId,
      timestamp: new Date().toISOString(),
      data: { daysSinceLastActivity }
    });
  }

  getN8NIntegration() {
    return this.n8nIntegration;
  }
}

export default AutomationManager;
