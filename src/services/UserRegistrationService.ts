
import MockBackendService from './MockBackendService';
import LoggingService from './LoggingService';
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

  constructor() {
    this.mockBackend = MockBackendService.getInstance();
    this.logger = LoggingService.getInstance();
    this.configManager = new RegistrationConfigManager();
  }

  static getInstance(): UserRegistrationService {
    if (!UserRegistrationService.instance) {
      UserRegistrationService.instance = new UserRegistrationService();
    }
    return UserRegistrationService.instance;
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
    return this.configManager.isUsingMockMode();
  }

  async registerUser(userData: UserRegistrationData): Promise<N8NWebhookResponse> {
    if (this.configManager.isUsingMockMode()) {
      return this.mockBackend.registerUser(userData);
    }

    try {
      if (!this.webhookClient) {
        throw new Error('Webhook client not initialized');
      }
      
      return await this.webhookClient.registerUser(userData);
    } catch (error) {
      this.logger.error('UserRegistrationService: Ошибка регистрации пользователя', { error, userId: userData.user_id });
      
      // Fallback на Mock режим при ошибке
      this.logger.warn('UserRegistrationService: Переключение на Mock режим из-за ошибки');
      return this.mockBackend.registerUser(userData);
    }
  }

  async checkUserExists(userId: string): Promise<N8NWebhookResponse> {
    if (this.configManager.isUsingMockMode()) {
      return this.mockBackend.checkUserExists(userId);
    }

    try {
      if (!this.webhookClient) {
        throw new Error('Webhook client not initialized');
      }
      
      return await this.webhookClient.checkUserExists(userId);
    } catch (error) {
      this.logger.error('UserRegistrationService: Ошибка проверки пользователя', { error, userId });
      
      // Fallback на Mock режим при ошибке
      return this.mockBackend.checkUserExists(userId);
    }
  }

  async updateUserActivity(userId: string): Promise<void> {
    if (this.configManager.isUsingMockMode()) {
      return this.mockBackend.updateUserActivity(userId);
    }

    try {
      if (!this.webhookClient) {
        throw new Error('Webhook client not initialized');
      }
      
      await this.webhookClient.updateUserActivity(userId);
    } catch (error) {
      this.logger.error('UserRegistrationService: Ошибка обновления активности', { error, userId });
      // Fallback на Mock режим
      return this.mockBackend.updateUserActivity(userId);
    }
  }

  async updateSubscription(userId: string, subscriptionData: any): Promise<N8NWebhookResponse> {
    if (this.configManager.isUsingMockMode()) {
      return this.mockBackend.updateSubscription(userId, subscriptionData);
    }

    try {
      if (!this.webhookClient) {
        throw new Error('Webhook client not initialized');
      }
      
      return await this.webhookClient.updateSubscription(userId, subscriptionData);
    } catch (error) {
      this.logger.error('UserRegistrationService: Ошибка обновления подписки', { error, userId });
      
      // Fallback на Mock режим при ошибке
      return this.mockBackend.updateSubscription(userId, subscriptionData);
    }
  }

  // Методы для управления Mock режимом
  getMockData() {
    return this.mockBackend.getAllUsers();
  }

  clearMockData() {
    this.mockBackend.clearAllData();
  }
}

export default UserRegistrationService;
