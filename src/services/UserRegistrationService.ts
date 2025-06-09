
import MockBackendService from './mock/MockBackendService';
import LoggingService from './LoggingService';
import FallbackManager from './fallback/FallbackManager';
import EnvironmentManager from './environment/EnvironmentManager';
import HealthCheckService from './health/HealthCheckService';
import { N8NWebhookClient } from './registration/N8NWebhookClient';
import { RegistrationConfigManager } from './registration/RegistrationConfigManager';
import { UserRegistrationData, N8NWebhookResponse } from './registration/types';

// Re-export types for backward compatibility
export type { UserRegistrationData, N8NWebhookResponse };

class UserRegistrationService {
  private static instance: UserRegistrationService;
  private mockBackend: MockBackendService;
  private logger: LoggingService;
  private configManager: RegistrationConfigManager;
  private webhookClient: N8NWebhookClient | null = null;
  private fallbackManager: FallbackManager;
  private environmentManager: EnvironmentManager;
  private healthCheckService: HealthCheckService;

  constructor() {
    this.mockBackend = MockBackendService.getInstance();
    this.logger = LoggingService.getInstance();
    this.configManager = new RegistrationConfigManager();
    this.fallbackManager = FallbackManager.getInstance();
    this.environmentManager = EnvironmentManager.getInstance();
    this.healthCheckService = HealthCheckService.getInstance();
    
    this.setupHealthChecks();
  }

  static getInstance(): UserRegistrationService {
    if (!UserRegistrationService.instance) {
      UserRegistrationService.instance = new UserRegistrationService();
    }
    return UserRegistrationService.instance;
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

  setWebhookUrl(url: string) {
    this.configManager.setWebhookUrl(url);
    
    if (url && url.length > 0) {
      this.webhookClient = new N8NWebhookClient(url);
    } else {
      this.webhookClient = null;
    }
  }

  isUsingMockMode(): boolean {
    return this.environmentManager.shouldUseMockData();
  }

  async registerUser(userData: UserRegistrationData): Promise<N8NWebhookResponse> {
    if (this.isUsingMockMode()) {
      this.logger.info('UserRegistrationService: используем Mock режим для регистрации');
      return this.mockBackend.registerUser(userData);
    }

    return await this.fallbackManager.executeWithFallback(
      'user_registration_webhook',
      async () => {
        if (!this.webhookClient) {
          throw new Error('Webhook client не инициализирован');
        }
        return await this.webhookClient.registerUser(userData);
      },
      {
        strategy: 'graceful-degradation',
        config: { maxRetries: 3, timeout: 8000 },
        fallbackFunction: async () => {
          this.logger.warn('UserRegistrationService: переключение на Mock режим из-за недоступности webhook');
          return this.mockBackend.registerUser(userData);
        }
      }
    );
  }

  async checkUserExists(userId: string): Promise<N8NWebhookResponse> {
    if (this.isUsingMockMode()) {
      return this.mockBackend.checkUserExists(userId);
    }

    return await this.fallbackManager.executeWithFallback(
      'user_check_webhook',
      async () => {
        if (!this.webhookClient) {
          throw new Error('Webhook client не инициализирован');
        }
        return await this.webhookClient.checkUserExists(userId);
      },
      {
        strategy: 'graceful-degradation',
        config: { maxRetries: 2, timeout: 5000 },
        fallbackFunction: async () => {
          this.logger.warn('UserRegistrationService: fallback на Mock режим для проверки пользователя');
          return this.mockBackend.checkUserExists(userId);
        }
      }
    );
  }

  async updateUserActivity(userId: string): Promise<void> {
    if (this.isUsingMockMode()) {
      return this.mockBackend.updateUserActivity(userId);
    }

    try {
      await this.fallbackManager.executeWithFallback(
        'user_activity_update',
        async () => {
          if (!this.webhookClient) {
            throw new Error('Webhook client не инициализирован');
          }
          await this.webhookClient.updateUserActivity(userId);
        },
        {
          strategy: 'graceful-degradation',
          config: { maxRetries: 1, timeout: 3000 },
          fallbackFunction: async () => {
            return this.mockBackend.updateUserActivity(userId);
          }
        }
      );
    } catch (error) {
      this.logger.error('UserRegistrationService: ошибка обновления активности', { error, userId });
      // Fallback на Mock режим как последний resort
      return this.mockBackend.updateUserActivity(userId);
    }
  }

  async updateSubscription(userId: string, subscriptionData: any): Promise<N8NWebhookResponse> {
    if (this.isUsingMockMode()) {
      return this.mockBackend.updateSubscription(userId, subscriptionData);
    }

    return await this.fallbackManager.executeWithFallback(
      'subscription_update_webhook',
      async () => {
        if (!this.webhookClient) {
          throw new Error('Webhook client не инициализирован');
        }
        return await this.webhookClient.updateSubscription(userId, subscriptionData);
      },
      {
        strategy: 'graceful-degradation',
        config: { maxRetries: 3, timeout: 8000 },
        fallbackFunction: async () => {
          this.logger.warn('UserRegistrationService: fallback на Mock режим для обновления подписки');
          return this.mockBackend.updateSubscription(userId, subscriptionData);
        }
      }
    );
  }

  // Методы для управления Mock режимом
  getMockData() {
    if (!this.isUsingMockMode()) {
      this.logger.warn('UserRegistrationService: попытка получить mock данные в production');
      return [];
    }
    return this.mockBackend.getAllUsers();
  }

  clearMockData() {
    if (!this.isUsingMockMode()) {
      this.logger.warn('UserRegistrationService: попытка очистить mock данные в production');
      return;
    }
    this.mockBackend.clearAllData();
  }

  // Новые методы для мониторинга и диагностики
  async getServiceHealth() {
    const health = this.healthCheckService.getServiceHealth('user_registration');
    const environmentMode = this.environmentManager.getMode();
    const usingMockMode = this.isUsingMockMode();
    
    return {
      health: health?.status || 'unknown',
      lastCheck: health?.lastCheck,
      errorCount: health?.errorCount || 0,
      environment: environmentMode,
      mockMode: usingMockMode,
      webhookConfigured: !!this.webhookClient
    };
  }

  getDetailedStatus() {
    return {
      mode: this.environmentManager.getMode(),
      mockEnabled: this.isUsingMockMode(),
      webhookUrl: this.configManager.getWebhookUrl() ? '***configured***' : 'not set',
      webhookClient: !!this.webhookClient,
      fallbacksEnabled: this.environmentManager.shouldEnableFallbacks(),
      mockDataVersion: this.isUsingMockMode() ? this.mockBackend.getMockDataVersion() : null
    };
  }
}

export default UserRegistrationService;
