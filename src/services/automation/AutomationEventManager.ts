
import LoggingService from '../LoggingService';
import N8NIntegration from './N8NIntegration';
import { AutomationConfig } from './AutomationConfig';
import { AutomationEvent } from '../../types/automation';
import { TelegramUser } from '../auth/types';

export class AutomationEventManager {
  private logger: LoggingService;
  private n8nIntegration: N8NIntegration;
  private config: AutomationConfig;

  constructor(config: AutomationConfig, n8nIntegration: N8NIntegration) {
    this.logger = LoggingService.getInstance();
    this.config = config;
    this.n8nIntegration = n8nIntegration;
  }

  async triggerEvent(event: AutomationEvent) {
    if (!this.config.isAutomationEnabled()) {
      this.logger.debug('AutomationManager отключен, событие пропущено', { event: event.type });
      return;
    }

    if (!this.config.hasWebhookUrl()) {
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

  async onUserRegistered(telegramUser: TelegramUser, fullName: string): Promise<void> {
    await this.triggerEvent({
      type: 'user_registered',
      user_id: telegramUser.id.toString(),
      timestamp: new Date().toISOString(),
      data: { fullName },
      telegram_data: {
        user_id: telegramUser.id,
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name
      }
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
}
