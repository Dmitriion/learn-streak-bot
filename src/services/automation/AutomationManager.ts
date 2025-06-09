
import LoggingService from '../LoggingService';
import N8NIntegration from './N8NIntegration';
import { AutomationConfig } from './AutomationConfig';
import { AutomationEventManager } from './AutomationEventManager';
import { AutomationHealthService } from './AutomationHealthService';
import { AutomationEvent, AutomationTrigger } from '../../types/automation';
import { AutomationHealthDetails } from '../../types/metrics';
import { TelegramUser } from '../auth/types';

class AutomationManager {
  private static instance: AutomationManager;
  private logger: LoggingService;
  private n8nIntegration: N8NIntegration;
  private config: AutomationConfig;
  private eventManager: AutomationEventManager;
  private healthService: AutomationHealthService;

  constructor() {
    this.logger = LoggingService.getInstance();
    this.n8nIntegration = N8NIntegration.getInstance();
    this.config = new AutomationConfig();
    this.eventManager = new AutomationEventManager(this.config, this.n8nIntegration);
    this.healthService = new AutomationHealthService(this.config, this.n8nIntegration);
    
    // Синхронизируем URL с N8N интеграцией
    const webhookUrl = this.config.getWebhookUrl();
    if (webhookUrl) {
      this.n8nIntegration.setWebhookUrl(webhookUrl);
    }
  }

  static getInstance(): AutomationManager {
    if (!AutomationManager.instance) {
      AutomationManager.instance = new AutomationManager();
    }
    return AutomationManager.instance;
  }

  setN8NWebhookUrl(url: string) {
    this.config.setN8NWebhookUrl(url);
    this.n8nIntegration.setWebhookUrl(url);
    this.logger.info('N8N webhook URL обновлен', { url });
  }

  enable() {
    this.config.enable();
    this.logger.info('AutomationManager включен');
  }

  disable() {
    this.config.disable();
    this.logger.info('AutomationManager отключен');
  }

  async triggerEvent(event: AutomationEvent) {
    return this.eventManager.triggerEvent(event);
  }

  async getHealthStatus(): Promise<{ 
    isHealthy: boolean; 
    details: AutomationHealthDetails;
  }> {
    return this.healthService.getHealthStatus();
  }

  getConfiguration() {
    return {
      ...this.config.getConfiguration(),
      enabled_triggers: this.n8nIntegration.getEnabledTriggers()
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
    return this.healthService.testConnection();
  }

  // Методы для автоматизации образовательных событий
  async onUserRegistered(telegramUser: TelegramUser, fullName: string): Promise<void> {
    return this.eventManager.onUserRegistered(telegramUser, fullName);
  }

  async onLessonCompleted(userId: string, lessonId: number, score?: number): Promise<void> {
    return this.eventManager.onLessonCompleted(userId, lessonId, score);
  }

  async onTestPassed(userId: string, lessonId: number, score: number, totalQuestions: number): Promise<void> {
    return this.eventManager.onTestPassed(userId, lessonId, score, totalQuestions);
  }

  async onPaymentSuccess(userId: string, planId: string, amount: number): Promise<void> {
    return this.eventManager.onPaymentSuccess(userId, planId, amount);
  }

  async onCourseCompleted(userId: string, totalLessons: number, finalScore: number): Promise<void> {
    return this.eventManager.onCourseCompleted(userId, totalLessons, finalScore);
  }

  async onUserInactive(userId: string, daysSinceLastActivity: number): Promise<void> {
    return this.eventManager.onUserInactive(userId, daysSinceLastActivity);
  }

  getN8NIntegration() {
    return this.n8nIntegration;
  }
}

export default AutomationManager;
