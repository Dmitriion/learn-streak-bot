import LoggingService from '../LoggingService';
import N8NIntegration from './N8NIntegration';
import EnvironmentManager from '../environment/EnvironmentManager';
import { AutomationEvent, AutomationConfig } from '../../types/automation';
import { AutomationHealthDetails } from '../../types/metrics';

class AutomationManager {
  private static instance: AutomationManager;
  private logger: LoggingService;
  private n8nIntegration: N8NIntegration;
  private environmentManager: EnvironmentManager;
  private isEnabled: boolean = true;
  private webhookUrl: string = '';

  constructor() {
    this.logger = LoggingService.getInstance();
    this.n8nIntegration = N8NIntegration.getInstance();
    this.environmentManager = EnvironmentManager.getInstance();
    this.initializeWebhookUrl();
  }

  static getInstance(): AutomationManager {
    if (!AutomationManager.instance) {
      AutomationManager.instance = new AutomationManager();
    }
    return AutomationManager.instance;
  }

  private initializeWebhookUrl() {
    const savedUrl = localStorage.getItem('n8n_webhook_url');
    if (savedUrl) {
      this.webhookUrl = savedUrl;
      this.n8nIntegration.setWebhookUrl(savedUrl);
    }
  }

  setN8NWebhookUrl(url: string) {
    this.webhookUrl = url;
    this.n8nIntegration.setWebhookUrl(url);
    localStorage.setItem('n8n_webhook_url', url);
    this.logger.info('N8N webhook URL обновлен', { url });
  }

  enable() {
    this.isEnabled = true;
    this.logger.info('AutomationManager включен');
  }

  disable() {
    this.isEnabled = false;
    this.logger.info('AutomationManager отключен');
  }

  async triggerEvent(event: AutomationEvent) {
    if (!this.isEnabled) {
      this.logger.debug('AutomationManager отключен, событие пропущено', { event: event.type });
      return;
    }

    if (!this.webhookUrl) {
      this.logger.warn('N8N webhook URL не настроен', { event: event.type });
      return;
    }

    try {
      this.logger.info('Отправка события в N8N', { event: event.type, userId: event.user_id });
      await this.n8nIntegration.sendEvent(event);
    } catch (error) {
      this.logger.error('Ошибка отправки события в N8N', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        event: event.type 
      });
    }
  }

  async getHealthStatus(): Promise<{ 
    isHealthy: boolean; 
    details: AutomationHealthDetails;
  }> {
    if (!this.webhookUrl) {
      return {
        isHealthy: false,
        details: {
          webhookUrl: '',
          lastSuccessfulCall: null,
          lastError: 'Webhook URL не настроен',
          responseTime: 0,
          status: 'unhealthy',
          retryCount: 0
        }
      };
    }

    try {
      const healthCheck = await this.n8nIntegration.healthCheck();
      return {
        isHealthy: healthCheck.isHealthy,
        details: {
          webhookUrl: this.webhookUrl,
          lastSuccessfulCall: healthCheck.lastSuccessfulCall,
          lastError: healthCheck.lastError,
          responseTime: healthCheck.responseTime || 0,
          status: healthCheck.isHealthy ? 'healthy' : 'unhealthy',
          retryCount: healthCheck.retryCount || 0
        }
      };
    } catch (error) {
      return {
        isHealthy: false,
        details: {
          webhookUrl: this.webhookUrl,
          lastSuccessfulCall: null,
          lastError: error instanceof Error ? error.message : 'Unknown error',
          responseTime: 0,
          status: 'unhealthy',
          retryCount: 0
        }
      };
    }
  }

  getConfiguration(): AutomationConfig {
    return {
      isEnabled: this.isEnabled,
      webhookUrl: this.webhookUrl,
      environment: this.environmentManager.getCurrentEnvironment()
    };
  }

  getN8NIntegration() {
    return this.n8nIntegration;
  }
}

export default AutomationManager;
