
import { N8NWebhookClient } from './N8NWebhookClient';
import MockBackendService from '../mock/MockBackendService';
import LoggingService from '../LoggingService';
import FallbackManager from '../fallback/FallbackManager';
import EnvironmentManager from '../environment/EnvironmentManager';

export class UserActivityManager {
  private mockBackend: MockBackendService;
  private logger: LoggingService;
  private fallbackManager: FallbackManager;
  private environmentManager: EnvironmentManager;
  private webhookClient: N8NWebhookClient | null = null;

  constructor() {
    this.mockBackend = MockBackendService.getInstance();
    this.logger = LoggingService.getInstance();
    this.fallbackManager = FallbackManager.getInstance();
    this.environmentManager = EnvironmentManager.getInstance();
  }

  setWebhookClient(webhookClient: N8NWebhookClient | null) {
    this.webhookClient = webhookClient;
  }

  isUsingMockMode(): boolean {
    return this.environmentManager.shouldUseMockData();
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
      this.logger.error('UserActivityManager: ошибка обновления активности', { error, userId });
      // Fallback на Mock режим как последний resort
      return this.mockBackend.updateUserActivity(userId);
    }
  }
}
