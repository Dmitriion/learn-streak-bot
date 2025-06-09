
import HealthCheckService from '../health/HealthCheckService';
import EnvironmentManager from '../environment/EnvironmentManager';
import { N8NWebhookClient } from './N8NWebhookClient';
import LoggingService from '../LoggingService';

export class RegistrationHealthMonitor {
  private healthCheckService: HealthCheckService;
  private environmentManager: EnvironmentManager;
  private logger: LoggingService;
  private webhookClient: N8NWebhookClient | null = null;

  constructor() {
    this.healthCheckService = HealthCheckService.getInstance();
    this.environmentManager = EnvironmentManager.getInstance();
    this.logger = LoggingService.getInstance();
    
    this.setupHealthChecks();
  }

  setWebhookClient(webhookClient: N8NWebhookClient | null) {
    this.webhookClient = webhookClient;
  }

  private setupHealthChecks() {
    this.healthCheckService.registerService('user_registration', async () => {
      if (this.environmentManager.shouldUseMockData()) {
        return { healthy: true };
      }
      
      if (!this.webhookClient) {
        return { healthy: false, error: 'Webhook client не инициализирован' };
      }
      
      try {
        // Простая проверка доступности webhook
        const result = await this.webhookClient.checkUserExists('health_check_user');
        return { healthy: true };
      } catch (error) {
        return { healthy: false, error: error.message };
      }
    });
  }

  async getServiceHealth() {
    const health = this.healthCheckService.getServiceHealth('user_registration');
    const environmentMode = this.environmentManager.getMode();
    const usingMockMode = this.environmentManager.shouldUseMockData();
    
    return {
      health: health?.status || 'unknown',
      lastCheck: health?.lastCheck,
      errorCount: health?.errorCount || 0,
      environment: environmentMode,
      mockMode: usingMockMode,
      webhookConfigured: !!this.webhookClient
    };
  }
}
