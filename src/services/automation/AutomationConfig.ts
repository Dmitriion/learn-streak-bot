
import { AutomationTrigger } from '../../types/automation';

export class AutomationConfig {
  private webhookUrl: string = '';
  private isEnabled: boolean = true;

  constructor() {
    this.initializeWebhookUrl();
  }

  private initializeWebhookUrl() {
    const savedUrl = localStorage.getItem('n8n_webhook_url');
    if (savedUrl) {
      this.webhookUrl = savedUrl;
    }
  }

  setN8NWebhookUrl(url: string) {
    this.webhookUrl = url;
    localStorage.setItem('n8n_webhook_url', url);
  }

  getWebhookUrl(): string {
    return this.webhookUrl;
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  isAutomationEnabled(): boolean {
    return this.isEnabled;
  }

  hasWebhookUrl(): boolean {
    return !!this.webhookUrl;
  }

  getConfiguration() {
    return {
      webhookUrl: this.webhookUrl,
      enabled: this.isEnabled,
      retry_settings: {
        max_retries: 3,
        retry_delay: 1000
      }
    };
  }
}
