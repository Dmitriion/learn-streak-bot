
import LoggingService from '../LoggingService';
import ErrorService from '../ErrorService';
import { AutomationEvent } from '../../types/automation';

export class N8NWebhookClient {
  private logger: LoggingService;
  private errorService: ErrorService;

  constructor() {
    this.logger = LoggingService.getInstance();
    this.errorService = ErrorService.getInstance();
  }

  async sendRequest(url: string, data: any, timeoutMs: number = 10000): Promise<boolean> {
    return this.errorService.withRetry(
      async () => this.performRequest(url, data, timeoutMs),
      3,
      1000,
      'network'
    );
  }

  private async performRequest(url: string, data: any, timeoutMs: number): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          environment: import.meta.env.MODE
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        this.logger.info('Запрос в N8N успешно отправлен', { 
          url,
          status: response.status 
        });
        return true;
      } else {
        this.logger.warn('N8N вернул ошибку', { 
          url,
          status: response.status 
        });
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        this.logger.error('Timeout при отправке запроса в N8N', { url });
        throw new Error('Request timeout');
      } else {
        this.logger.error('Ошибка отправки запроса в N8N', { 
          error,
          url 
        });
        throw error;
      }
    }
  }

  async sendEvent(webhookUrl: string, event: AutomationEvent): Promise<boolean> {
    try {
      return await this.sendRequest(webhookUrl, event);
    } catch (error) {
      this.errorService.handleNetworkError(error as Error, {
        webhookUrl,
        eventType: event.type,
        userId: event.user_id
      });
      return false;
    }
  }

  async testConnection(baseUrl: string): Promise<{ success: boolean; error?: string }> {
    if (!baseUrl) {
      return { success: false, error: 'Webhook URL не настроен' };
    }

    if (!this.isValidUrl(baseUrl)) {
      return { success: false, error: 'Невалидный URL формат' };
    }

    try {
      const testUrl = `${baseUrl}/test`;
      const testData = {
        test: true,
        timestamp: new Date().toISOString(),
        environment: import.meta.env.MODE
      };

      const success = await this.sendRequest(testUrl, testData, 5000);
      
      if (success) {
        this.logger.info('N8N соединение успешно протестировано');
        return { success: true };
      } else {
        return { success: false, error: 'Ошибка соединения' };
      }
    } catch (error) {
      this.logger.error('Ошибка тестирования N8N соединения', { error });
      return { success: false, error: error instanceof Error ? error.message : 'Неизвестная ошибка' };
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }
}
