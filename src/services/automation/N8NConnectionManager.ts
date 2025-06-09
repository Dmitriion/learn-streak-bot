
import { N8NConfig } from './N8NConfig';
import { N8NWebhookClient } from './N8NWebhookClient';

export class N8NConnectionManager {
  private config: N8NConfig;
  private webhookClient: N8NWebhookClient;

  constructor(config: N8NConfig, webhookClient: N8NWebhookClient) {
    this.config = config;
    this.webhookClient = webhookClient;
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    const baseUrl = this.config.getWebhookUrl();
    return this.webhookClient.testConnection(baseUrl);
  }

  isConfigured(): boolean {
    return this.config.isConfigured();
  }

  getConnectionStatus(): {
    configured: boolean;
    webhookUrl: string;
    enabledTriggersCount: number;
  } {
    return {
      configured: this.config.isConfigured(),
      webhookUrl: this.config.getWebhookUrl(),
      enabledTriggersCount: this.config.getEnabledTriggers().length
    };
  }

  async validateConnection(): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!this.config.isConfigured()) {
      errors.push('Webhook URL не настроен');
    }

    const enabledTriggers = this.config.getEnabledTriggers();
    if (enabledTriggers.length === 0) {
      warnings.push('Нет активных триггеров');
    }

    if (this.config.isConfigured()) {
      try {
        const connectionTest = await this.testConnection();
        if (!connectionTest.success) {
          errors.push(`Ошибка соединения: ${connectionTest.error}`);
        }
      } catch (error) {
        errors.push('Ошибка при тестировании соединения');
        console.error('[N8NConnectionManager] Ошибка тестирования соединения:', error);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
