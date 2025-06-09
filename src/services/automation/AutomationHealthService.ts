
import LoggingService from '../LoggingService';
import N8NIntegration from './N8NIntegration';
import { AutomationConfig } from './AutomationConfig';
import { AutomationHealthDetails } from '../../types/metrics';

export class AutomationHealthService {
  private logger: LoggingService;
  private n8nIntegration: N8NIntegration;
  private config: AutomationConfig;

  constructor(config: AutomationConfig, n8nIntegration: N8NIntegration) {
    this.logger = LoggingService.getInstance();
    this.config = config;
    this.n8nIntegration = n8nIntegration;
  }

  async getHealthStatus(): Promise<{ 
    isHealthy: boolean; 
    details: AutomationHealthDetails;
  }> {
    const webhookUrl = this.config.getWebhookUrl();
    
    if (!webhookUrl) {
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
      const connectionTest = await this.n8nIntegration.testConnection();
      return {
        isHealthy: connectionTest.success,
        details: {
          webhookUrl: webhookUrl,
          lastSuccessfulCall: connectionTest.success ? new Date().toISOString() : null,
          lastError: connectionTest.error || null,
          responseTime: 0,
          status: connectionTest.success ? 'healthy' : 'unhealthy',
          retryCount: 0
        }
      };
    } catch (error) {
      return {
        isHealthy: false,
        details: {
          webhookUrl: webhookUrl,
          lastSuccessfulCall: null,
          lastError: error instanceof Error ? error.message : 'Unknown error',
          responseTime: 0,
          status: 'unhealthy',
          retryCount: 0
        }
      };
    }
  }

  async testConnection(): Promise<boolean> {
    const result = await this.n8nIntegration.testConnection();
    return result.success;
  }
}
