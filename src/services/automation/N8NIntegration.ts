
import { AutomationEvent, N8NWebhookEvent, AutomationConfig, AutomationTrigger } from '../../types/automation';
import { N8NConfig } from './N8NConfig';
import { N8NWebhookClient } from './N8NWebhookClient';
import { N8NConnectionManager } from './N8NConnectionManager';

class N8NIntegration {
  private static instance: N8NIntegration;
  private config: N8NConfig;
  private webhookClient: N8NWebhookClient;
  private connectionManager: N8NConnectionManager;

  constructor() {
    this.config = new N8NConfig();
    this.webhookClient = new N8NWebhookClient();
    this.connectionManager = new N8NConnectionManager(this.config, this.webhookClient);
  }

  static getInstance(): N8NIntegration {
    if (!N8NIntegration.instance) {
      N8NIntegration.instance = new N8NIntegration();
    }
    return N8NIntegration.instance;
  }

  setWebhookUrl(url: string) {
    this.config.setWebhookUrl(url);
  }

  // Метод для совместимости с AutomationManager
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
    if (!this.config.isConfigured()) {
      console.warn('[N8NIntegration] N8N webhook URL не настроен, пропускаем отправку события', { event });
      return false;
    }

    const trigger = this.config.findTrigger(event.type);
    if (!trigger || !trigger.enabled) {
      console.warn('[N8NIntegration] Триггер отключен или не найден', { eventType: event.type });
      return false;
    }

    const webhookUrl = this.config.buildWebhookUrl(trigger);
    return await this.webhookClient.sendEvent(webhookUrl, event);
  }

  // Методы для управления конфигурацией
  updateConfig(config: Partial<AutomationConfig>) {
    this.config.updateConfig(config);
  }

  getEnabledTriggers(): AutomationTrigger[] {
    return this.config.getEnabledTriggers();
  }

  toggleTrigger(triggerId: string, enabled: boolean) {
    this.config.toggleTrigger(triggerId, enabled);
  }

  // Методы для тестирования соединения
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    return this.connectionManager.testConnection();
  }

  isConfigured(): boolean {
    return this.connectionManager.isConfigured();
  }

  getConnectionStatus() {
    return this.connectionManager.getConnectionStatus();
  }

  async validateConnection() {
    return this.connectionManager.validateConnection();
  }
}

export default N8NIntegration;
