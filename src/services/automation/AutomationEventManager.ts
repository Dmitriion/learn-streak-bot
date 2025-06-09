
import ErrorService from '../ErrorService';
import N8NIntegration from './N8NIntegration';
import { AutomationConfig } from './AutomationConfig';
import { AutomationEvent } from '../../types/automation';
import { TelegramUser } from '../auth/types';
import { toast } from '@/hooks/use-toast';

export class AutomationEventManager {
  private errorService: ErrorService;
  private n8nIntegration: N8NIntegration;
  private config: AutomationConfig;

  constructor(config: AutomationConfig, n8nIntegration: N8NIntegration) {
    this.errorService = ErrorService.getInstance();
    this.config = config;
    this.n8nIntegration = n8nIntegration;
  }

  async triggerEvent(event: AutomationEvent) {
    if (!this.config.isAutomationEnabled()) {
      console.debug('[AutomationEventManager] AutomationManager отключен, событие пропущено', { event: event.type });
      return;
    }

    if (!this.config.hasWebhookUrl()) {
      console.warn('[AutomationEventManager] N8N webhook URL не настроен', { event: event.type });
      this.showConfigurationWarning();
      return;
    }

    try {
      console.info('[AutomationEventManager] Отправка события в N8N', { event: event.type, userId: event.user_id });
      const success = await this.n8nIntegration.sendEvent(event);
      
      if (success) {
        this.showSuccessNotification(event.type);
      } else {
        this.showErrorNotification(event.type, 'Ошибка отправки в N8N');
      }
    } catch (error) {
      console.error('[AutomationEventManager] Ошибка отправки события в N8N', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        event: event.type 
      });
      
      this.errorService.handleNetworkError(error as Error, {
        eventType: event.type,
        userId: event.user_id
      });
      
      this.showErrorNotification(event.type, 'Сетевая ошибка');
    }
  }

  private showSuccessNotification(eventType: string) {
    if (import.meta.env.DEV) {
      toast({
        title: "Автоматизация",
        description: `Событие "${eventType}" успешно отправлено в N8N`,
        duration: 3000,
      });
    }
  }

  private showErrorNotification(eventType: string, error: string) {
    toast({
      title: "Ошибка автоматизации",
      description: `Не удалось отправить событие "${eventType}": ${error}`,
      variant: "destructive",
      duration: 5000,
    });
  }

  private showConfigurationWarning() {
    toast({
      title: "Настройка автоматизации",
      description: "N8N webhook URL не настроен. Перейдите в настройки для конфигурации.",
      variant: "destructive",
      duration: 5000,
    });
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
