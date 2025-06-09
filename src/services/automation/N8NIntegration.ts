
import LoggingService from '../LoggingService';
import { AutomationEvent, N8NWebhookEvent, AutomationConfig, AutomationTrigger } from '../../types/automation';

class N8NIntegration {
  private static instance: N8NIntegration;
  private logger: LoggingService;
  private baseWebhookUrl: string;
  private triggers: AutomationTrigger[] = [];

  constructor() {
    this.logger = LoggingService.getInstance();
    this.baseWebhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || '';
    this.initializeDefaultTriggers();
  }

  static getInstance(): N8NIntegration {
    if (!N8NIntegration.instance) {
      N8NIntegration.instance = new N8NIntegration();
    }
    return N8NIntegration.instance;
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
      }
    ];
  }

  setWebhookUrl(url: string) {
    this.baseWebhookUrl = url;
    this.logger.info('N8N webhook URL обновлен', { 
      hasUrl: !!url,
      environment: import.meta.env.MODE 
    });
  }

  // Новый метод для совместимости с AutomationManager
  async triggerWebhook(event: N8NWebhookEvent): Promise<boolean> {
    const automationEvent: AutomationEvent = {
      type: event.event_type,
      user_id: event.user_id,
      timestamp: event.timestamp,
      data: event.data,
      telegram_data: event.telegram_data
    };
    return await this.sendEvent(automationEvent);
  }

  async sendEvent(event: AutomationEvent): Promise<boolean> {
    if (!this.baseWebhookUrl) {
      this.logger.warn('N8N webhook URL не настроен, пропускаем отправку события', { event });
      return false;
    }

    try {
      const trigger = this.triggers.find(t => t.id === event.type);
      if (!trigger || !trigger.enabled) {
        this.logger.warn('Триггер отключен или не найден', { eventType: event.type });
        return false;
      }

      const webhookUrl = `${this.baseWebhookUrl}${trigger.webhook_url}`;
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...event,
          timestamp: new Date().toISOString(),
          environment: import.meta.env.MODE
        }),
      });

      if (response.ok) {
        this.logger.info('Событие успешно отправлено в N8N', { 
          eventType: event.type,
          status: response.status 
        });
        return true;
      } else {
        this.logger.warn('N8N вернул ошибку', { 
          status: response.status,
          eventType: event.type 
        });
        return false;
      }
    } catch (error) {
      this.logger.error('Ошибка отправки события в N8N', { 
        error,
        eventType: event.type 
      });
      return false;
    }
  }

  // Новый метод для обновления конфигурации
  updateConfig(config: Partial<AutomationConfig>) {
    if (config.base_webhook_url) {
      this.setWebhookUrl(config.base_webhook_url);
    }
    if (config.enabled_triggers) {
      this.triggers = config.enabled_triggers;
    }
    this.logger.info('N8N конфигурация обновлена', { config });
  }

  // Новый метод для получения активных триггеров
  getEnabledTriggers(): AutomationTrigger[] {
    return this.triggers.filter(trigger => trigger.enabled);
  }

  // Новый метод для управления триггерами
  toggleTrigger(triggerId: string, enabled: boolean) {
    const trigger = this.triggers.find(t => t.id === triggerId);
    if (trigger) {
      trigger.enabled = enabled;
      this.logger.info('Триггер обновлен', { triggerId, enabled });
    } else {
      this.logger.warn('Триггер не найден', { triggerId });
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.baseWebhookUrl) {
      return { success: false, error: 'Webhook URL не настроен' };
    }

    try {
      const testUrl = `${this.baseWebhookUrl}/test`;
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          environment: import.meta.env.MODE
        }),
      });

      if (response.ok) {
        this.logger.info('N8N соединение успешно протестировано');
        return { success: true };
      } else {
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      this.logger.error('Ошибка тестирования N8N соединения', { error });
      return { success: false, error: 'Ошибка соединения' };
    }
  }

  isConfigured(): boolean {
    return !!this.baseWebhookUrl;
  }
}

export default N8NIntegration;
