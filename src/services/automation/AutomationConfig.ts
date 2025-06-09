
import { AutomationTrigger } from '../../types/automation';
import SecurityValidationService from '../validation/SecurityValidationService';

export class AutomationConfig {
  private webhookUrl: string = '';
  private isEnabled: boolean = true;
  private cachedConfiguration: any = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 минут
  private securityValidator: SecurityValidationService;

  constructor() {
    this.securityValidator = SecurityValidationService.getInstance();
    this.initializeWebhookUrl();
  }

  private initializeWebhookUrl() {
    const savedUrl = localStorage.getItem('n8n_webhook_url');
    if (savedUrl) {
      this.webhookUrl = savedUrl;
    }
  }

  setN8NWebhookUrl(url: string) {
    // Валидация URL перед сохранением
    if (url.trim()) {
      const validation = this.securityValidator.validateWebhookUrl(url.trim());
      if (!validation.isValid) {
        throw new Error(`Невалидный webhook URL: ${validation.error}`);
      }
    }

    this.webhookUrl = url;
    localStorage.setItem('n8n_webhook_url', url);
    this.invalidateCache();
  }

  getWebhookUrl(): string {
    return this.webhookUrl;
  }

  enable() {
    this.isEnabled = true;
    this.invalidateCache();
  }

  disable() {
    this.isEnabled = false;
    this.invalidateCache();
  }

  isAutomationEnabled(): boolean {
    return this.isEnabled;
  }

  hasWebhookUrl(): boolean {
    return !!this.webhookUrl;
  }

  getConfiguration() {
    const now = Date.now();
    
    // Проверяем кэш
    if (this.cachedConfiguration && (now - this.cacheTimestamp) < this.CACHE_TTL) {
      return this.cachedConfiguration;
    }

    // Создаем новую конфигурацию
    this.cachedConfiguration = {
      webhookUrl: this.webhookUrl,
      enabled: this.isEnabled,
      retry_settings: {
        max_retries: 3,
        retry_delay: 1000
      },
      lastUpdated: new Date().toISOString()
    };
    
    this.cacheTimestamp = now;
    return this.cachedConfiguration;
  }

  private invalidateCache() {
    this.cachedConfiguration = null;
    this.cacheTimestamp = 0;
  }

  validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.hasWebhookUrl()) {
      errors.push('Webhook URL не настроен');
    } else {
      const validation = this.securityValidator.validateWebhookUrl(this.webhookUrl);
      if (!validation.isValid) {
        errors.push(`Невалидный webhook URL: ${validation.error}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
