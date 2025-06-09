
import { N8NWebhookClient } from './N8NWebhookClient';
import { RegistrationConfigManager } from './RegistrationConfigManager';
import { UserRegistrationData, N8NWebhookResponse } from './types';
import MockBackendService from '../mock/MockBackendService';
import LoggingService from '../LoggingService';
import FallbackManager from '../fallback/FallbackManager';
import EnvironmentManager from '../environment/EnvironmentManager';

export class UserRegistrationCore {
  private mockBackend: MockBackendService;
  private logger: LoggingService;
  private configManager: RegistrationConfigManager;
  private webhookClient: N8NWebhookClient | null = null;
  private fallbackManager: FallbackManager;
  private environmentManager: EnvironmentManager;

  constructor() {
    this.mockBackend = MockBackendService.getInstance();
    this.logger = LoggingService.getInstance();
    this.configManager = new RegistrationConfigManager();
    this.fallbackManager = FallbackManager.getInstance();
    this.environmentManager = EnvironmentManager.getInstance();
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
      this.logger.info('UserRegistrationCore: используем Mock режим для регистрации');
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
          this.logger.warn('UserRegistrationCore: переключение на Mock режим из-за недоступности webhook');
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
          this.logger.warn('UserRegistrationCore: fallback на Mock режим для проверки пользователя');
          return this.mockBackend.checkUserExists(userId);
        }
      }
    );
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
          this.logger.warn('UserRegistrationCore: fallback на Mock режим для обновления подписки');
          return this.mockBackend.updateSubscription(userId, subscriptionData);
        }
      }
    );
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

  getMockData() {
    if (!this.isUsingMockMode()) {
      this.logger.warn('UserRegistrationCore: попытка получить mock данные в production');
      return [];
    }
    return this.mockBackend.getAllUsers();
  }

  clearMockData() {
    if (!this.isUsingMockMode()) {
      this.logger.warn('UserRegistrationCore: попытка очистить mock данные в production');
      return;
    }
    this.mockBackend.clearAllData();
  }
}
