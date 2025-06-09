
import { AutomationEvent, N8NWebhookResponse } from '../../types/automation';

export class N8NWebhookClient {
  private maxRetries: number = 3;
  private retryDelay: number = 1000;

  constructor() {
    // Removed LoggingService dependency to prevent circular dependency
  }

  async sendEvent(webhookUrl: string, event: AutomationEvent): Promise<boolean> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.info(`[N8NWebhookClient] Попытка ${attempt}/${this.maxRetries} отправки события`, {
          eventType: event.type,
          userId: event.user_id,
          webhookUrl: webhookUrl ? 'configured' : 'not set'
        });

        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json().catch(() => ({ success: true }));
        
        console.info('[N8NWebhookClient] Событие успешно отправлено', {
          eventType: event.type,
          userId: event.user_id,
          attempt
        });

        return true;
      } catch (error) {
        lastError = error as Error;
        console.warn(`[N8NWebhookClient] Ошибка отправки события (попытка ${attempt}/${this.maxRetries})`, {
          error: lastError.message,
          eventType: event.type,
          userId: event.user_id
        });

        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    console.error('[N8NWebhookClient] Все попытки отправки исчерпаны', {
      error: lastError?.message,
      eventType: event.type,
      userId: event.user_id,
      maxRetries: this.maxRetries
    });

    return false;
  }

  async testConnection(webhookUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.info('[N8NWebhookClient] Тестирование соединения с N8N', { webhookUrl: webhookUrl ? 'configured' : 'empty' });

      if (!webhookUrl) {
        return {
          success: false,
          error: 'Webhook URL не настроен'
        };
      }

      const testEvent: AutomationEvent = {
        type: 'connection_test',
        user_id: 'test_user',
        timestamp: new Date().toISOString(),
        data: { test: true }
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testEvent),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      console.info('[N8NWebhookClient] Тест соединения успешен');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[N8NWebhookClient] Ошибка тестирования соединения', { error: errorMessage });
      return {
        success: false,
        error: errorMessage
      };
    }
  }
}
