
import LoggingService from '../LoggingService';
import { AutomationEvent } from '../../types/automation';

class N8NIntegration {
  private static instance: N8NIntegration;
  private logger: LoggingService;
  private baseWebhookUrl: string;

  constructor() {
    this.logger = LoggingService.getInstance();
    this.baseWebhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || '';
  }

  static getInstance(): N8NIntegration {
    if (!N8NIntegration.instance) {
      N8NIntegration.instance = new N8NIntegration();
    }
    return N8NIntegration.instance;
  }

  setWebhookUrl(url: string) {
    this.baseWebhookUrl = url;
    this.logger.info('N8N webhook URL обновлен', { 
      hasUrl: !!url,
      environment: import.meta.env.MODE 
    });
  }

  async sendEvent(event: AutomationEvent): Promise<boolean> {
    if (!this.baseWebhookUrl) {
      this.logger.warn('N8N webhook URL не настроен, пропускаем отправку события', { event });
      return false;
    }

    try {
      const webhookUrl = `${this.baseWebhookUrl}/${event.type}`;
      
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
