
import { AutomationTrigger, AutomationConfig } from '../../types/automation';

export class N8NConfig {
  private triggers: AutomationTrigger[] = [];
  private baseWebhookUrl: string = '';

  constructor() {
    this.initializeDefaultTriggers();
    this.loadFromEnvironment();
  }

  private loadFromEnvironment() {
    this.baseWebhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || '';
  }

  private initializeDefaultTriggers() {
    this.triggers = [
      {
        id: 'user_registered',
        name: 'Регистрация пользователя',
        event_type: 'user_registered',
        webhook_url: '/webhook/user/registered',
        enabled: true,
        description: 'Отправляется при регистрации нового пользователя'
      },
      {
        id: 'lesson_completed',
        name: 'Урок завершен',
        event_type: 'lesson_completed',
        webhook_url: '/webhook/lesson/completed',
        enabled: true,
        description: 'Отправляется при завершении урока'
      },
      {
        id: 'test_passed',
        name: 'Тест пройден',
        event_type: 'test_passed',
        webhook_url: '/webhook/test/passed',
        enabled: true,
        description: 'Отправляется при прохождении теста'
      },
      {
        id: 'payment_success',
        name: 'Платеж успешен',
        event_type: 'payment_success',
        webhook_url: '/webhook/payment/success',
        enabled: true,
        description: 'Отправляется при успешном платеже'
      },
      {
        id: 'course_completed',
        name: 'Курс завершен',
        event_type: 'course_completed',
        webhook_url: '/webhook/course/completed',
        enabled: true,
        description: 'Отправляется при завершении курса'
      },
      {
        id: 'user_inactive',
        name: 'Пользователь неактивен',
        event_type: 'user_inactive',
        webhook_url: '/webhook/user/inactive',
        enabled: true,
        description: 'Отправляется при длительной неактивности'
      },
      {
        id: 'logs_batch',
        name: 'Пакет логов',
        event_type: 'logs_batch',
        webhook_url: '/webhook/logs/batch',
        enabled: true,
        description: 'Отправляется для централизованного логирования'
      }
    ];
  }

  setWebhookUrl(url: string) {
    this.baseWebhookUrl = url;
    console.info('[N8NConfig] N8N webhook URL обновлен', { 
      hasUrl: !!url,
      environment: import.meta.env.MODE 
    });
  }

  getWebhookUrl(): string {
    return this.baseWebhookUrl;
  }

  isConfigured(): boolean {
    return !!this.baseWebhookUrl;
  }

  getEnabledTriggers(): AutomationTrigger[] {
    return this.triggers.filter(trigger => trigger.enabled);
  }

  getAllTriggers(): AutomationTrigger[] {
    return [...this.triggers];
  }

  findTrigger(eventType: string): AutomationTrigger | undefined {
    return this.triggers.find(t => t.id === eventType);
  }

  toggleTrigger(triggerId: string, enabled: boolean) {
    const trigger = this.triggers.find(t => t.id === triggerId);
    if (trigger) {
      trigger.enabled = enabled;
      console.info('[N8NConfig] Триггер обновлен', { triggerId, enabled });
    } else {
      console.warn('[N8NConfig] Триггер не найден', { triggerId });
    }
  }

  updateConfig(config: Partial<AutomationConfig>) {
    if (config.base_webhook_url) {
      this.setWebhookUrl(config.base_webhook_url);
    }
    if (config.enabled_triggers) {
      this.triggers = config.enabled_triggers;
    }
    console.info('[N8NConfig] N8N конфигурация обновлена', { config });
  }

  buildWebhookUrl(trigger: AutomationTrigger): string {
    return `${this.baseWebhookUrl}${trigger.webhook_url}`;
  }
}
