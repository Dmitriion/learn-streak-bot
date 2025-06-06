
import { N8NWebhookEvent, AutomationConfig, N8NWebhookResponse, AutomationTrigger } from '../../types/automation';
import LoggingService from '../LoggingService';
import ErrorService from '../ErrorService';

class N8NIntegration {
  private static instance: N8NIntegration;
  private config: AutomationConfig;
  private logger: LoggingService;
  private errorService: ErrorService;

  constructor() {
    this.logger = LoggingService.getInstance();
    this.errorService = ErrorService.getInstance();
    this.config = this.getDefaultConfig();
  }

  static getInstance(): N8NIntegration {
    if (!N8NIntegration.instance) {
      N8NIntegration.instance = new N8NIntegration();
    }
    return N8NIntegration.instance;
  }

  private getDefaultConfig(): AutomationConfig {
    return {
      base_webhook_url: 'https://your-n8n-instance.com/webhook',
      enabled_triggers: [
        {
          id: 'user_registered',
          name: 'Регистрация пользователя',
          event_type: 'user_registered',
          webhook_url: '/user/registered',
          enabled: true,
          description: 'Триггер при регистрации нового пользователя'
        },
        {
          id: 'lesson_completed',
          name: 'Урок завершен',
          event_type: 'lesson_completed',
          webhook_url: '/lesson/completed',
          enabled: true,
          description: 'Триггер при завершении урока'
        },
        {
          id: 'test_passed',
          name: 'Тест пройден',
          event_type: 'test_passed',
          webhook_url: '/test/passed',
          enabled: true,
          description: 'Триггер при успешном прохождении теста'
        },
        {
          id: 'payment_success',
          name: 'Успешная оплата',
          event_type: 'payment_success',
          webhook_url: '/payment/success',
          enabled: true,
          description: 'Триггер при успешной оплате подписки'
        },
        {
          id: 'course_completed',
          name: 'Курс завершен',
          event_type: 'course_completed',
          webhook_url: '/course/completed',
          enabled: true,
          description: 'Триггер при завершении всего курса'
        },
        {
          id: 'user_inactive',
          name: 'Пользователь неактивен',
          event_type: 'user_inactive',
          webhook_url: '/user/inactive',
          enabled: true,
          description: 'Триггер при длительной неактивности пользователя'
        }
      ],
      retry_settings: {
        max_retries: 3,
        retry_delay: 1000
      }
    };
  }

  updateConfig(newConfig: Partial<AutomationConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.logger.info('Конфигурация N8N обновлена', { config: this.config });
  }

  async triggerWebhook(event: N8NWebhookEvent): Promise<N8NWebhookResponse> {
    const trigger = this.config.enabled_triggers.find(t => t.event_type === event.event_type);
    
    if (!trigger || !trigger.enabled) {
      this.logger.debug('Триггер отключен или не найден', { event_type: event.event_type });
      return { success: false, message: 'Триггер отключен' };
    }

    const webhookUrl = `${this.config.base_webhook_url}${trigger.webhook_url}`;
    
    this.logger.info('Отправка webhook в N8N', {
      event_type: event.event_type,
      user_id: event.user_id,
      webhook_url: webhookUrl
    });

    try {
      const response = await this.errorService.withRetry(
        () => this.sendWebhook(webhookUrl, event),
        this.config.retry_settings.max_retries,
        this.config.retry_settings.retry_delay,
        'network'
      );

      this.logger.info('Webhook успешно отправлен в N8N', {
        event_type: event.event_type,
        user_id: event.user_id,
        response
      });

      return response;
    } catch (error) {
      this.errorService.handleError({
        category: 'network',
        message: 'Ошибка отправки webhook в N8N',
        originalError: error as Error,
        context: { event, webhookUrl },
        recoverable: true
      });

      return {
        success: false,
        message: 'Ошибка отправки webhook'
      };
    }
  }

  private async sendWebhook(url: string, event: N8NWebhookEvent): Promise<N8NWebhookResponse> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'telegram-education-app'
      },
      body: JSON.stringify({
        ...event,
        app_version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      message: result.message || 'Webhook processed successfully',
      workflow_id: result.workflow_id,
      execution_id: result.execution_id
    };
  }

  getEnabledTriggers(): AutomationTrigger[] {
    return this.config.enabled_triggers.filter(trigger => trigger.enabled);
  }

  toggleTrigger(triggerId: string, enabled: boolean) {
    const trigger = this.config.enabled_triggers.find(t => t.id === triggerId);
    if (trigger) {
      trigger.enabled = enabled;
      this.logger.info('Статус триггера изменен', { triggerId, enabled });
    }
  }
}

export default N8NIntegration;
