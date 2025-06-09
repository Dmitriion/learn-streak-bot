
import { UserRegistrationCore } from './registration/UserRegistrationCore';
import { UserActivityManager } from './registration/UserActivityManager';
import { RegistrationHealthMonitor } from './registration/RegistrationHealthMonitor';
import { N8NWebhookClient } from './registration/N8NWebhookClient';
import { UserRegistrationData, N8NWebhookResponse } from './registration/types';

// Re-export types for backward compatibility
export type { UserRegistrationData, N8NWebhookResponse };

class UserRegistrationService {
  private static instance: UserRegistrationService;
  private registrationCore: UserRegistrationCore;
  private activityManager: UserActivityManager;
  private healthMonitor: RegistrationHealthMonitor;
  private webhookClient: N8NWebhookClient | null = null;

  constructor() {
    this.registrationCore = new UserRegistrationCore();
    this.activityManager = new UserActivityManager();
    this.healthMonitor = new RegistrationHealthMonitor();
  }

  static getInstance(): UserRegistrationService {
    if (!UserRegistrationService.instance) {
      UserRegistrationService.instance = new UserRegistrationService();
    }
    return UserRegistrationService.instance;
  }

  setWebhookUrl(url: string) {
    this.registrationCore.setWebhookUrl(url);
    
    // Configure webhook client for all dependent services
    if (url && url.length > 0) {
      this.webhookClient = new N8NWebhookClient(url);
      this.activityManager.setWebhookClient(this.webhookClient);
      this.healthMonitor.setWebhookClient(this.webhookClient);
    } else {
      this.webhookClient = null;
      this.activityManager.setWebhookClient(null);
      this.healthMonitor.setWebhookClient(null);
    }
  }

  isUsingMockMode(): boolean {
    return this.registrationCore.isUsingMockMode();
  }

  async registerUser(userData: UserRegistrationData): Promise<N8NWebhookResponse> {
    return await this.registrationCore.registerUser(userData);
  }

  async checkUserExists(userId: string): Promise<N8NWebhookResponse> {
    return await this.registrationCore.checkUserExists(userId);
  }

  async updateUserActivity(userId: string): Promise<void> {
    return await this.activityManager.updateUserActivity(userId);
  }

  async updateSubscription(userId: string, subscriptionData: any): Promise<N8NWebhookResponse> {
    return await this.registrationCore.updateSubscription(userId, subscriptionData);
  }

  // Методы для управления Mock режимом
  getMockData() {
    return this.registrationCore.getMockData();
  }

  clearMockData() {
    this.registrationCore.clearMockData();
  }

  // Новые методы для мониторинга и диагностики
  async getServiceHealth() {
    return await this.healthMonitor.getServiceHealth();
  }

  getDetailedStatus() {
    return this.registrationCore.getDetailedStatus();
  }
}

export default UserRegistrationService;
