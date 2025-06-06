
import N8NIntegration from './N8NIntegration';
import { N8NWebhookEvent } from '../../types/automation';
import { TelegramUser } from '../auth/types';
import LoggingService from '../LoggingService';

class AutomationManager {
  private static instance: AutomationManager;
  private n8nIntegration: N8NIntegration;
  private logger: LoggingService;

  constructor() {
    this.n8nIntegration = N8NIntegration.getInstance();
    this.logger = LoggingService.getInstance();
  }

  static getInstance(): AutomationManager {
    if (!AutomationManager.instance) {
      AutomationManager.instance = new AutomationManager();
    }
    return AutomationManager.instance;
  }

  // Методы для триггеров событий обучения
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

    await this.n8nIntegration.triggerWebhook(event);
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

    await this.n8nIntegration.triggerWebhook(event);
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

    await this.n8nIntegration.triggerWebhook(event);
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

    await this.n8nIntegration.triggerWebhook(event);
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

    await this.n8nIntegration.triggerWebhook(event);
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

    await this.n8nIntegration.triggerWebhook(event);
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
}

export default AutomationManager;
