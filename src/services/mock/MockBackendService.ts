
import { UserRegistrationData, N8NWebhookResponse } from '../registration/types';
import LoggingService from '../LoggingService';
import EnvironmentManager from '../environment/EnvironmentManager';
import MockDataProvider from './MockDataProvider';
import MockUserManager from './MockUserManager';
import MockSubscriptionManager from './MockSubscriptionManager';
import MockStorageManager from './MockStorageManager';
import { MockUserData, SubscriptionUpdateData } from './types';

class MockBackendService {
  private static instance: MockBackendService;
  private logger: LoggingService;
  private environmentManager: EnvironmentManager;
  private mockDataProvider: MockDataProvider;
  private userManager: MockUserManager;
  private subscriptionManager: MockSubscriptionManager;
  private storageManager: MockStorageManager;

  constructor() {
    this.logger = LoggingService.getInstance();
    this.environmentManager = EnvironmentManager.getInstance();
    this.mockDataProvider = MockDataProvider.getInstance();
    this.userManager = new MockUserManager();
    this.subscriptionManager = new MockSubscriptionManager();
    this.storageManager = new MockStorageManager();
  }

  static getInstance(): MockBackendService {
    if (!MockBackendService.instance) {
      MockBackendService.instance = new MockBackendService();
    }
    return MockBackendService.instance;
  }

  async registerUser(userData: UserRegistrationData): Promise<N8NWebhookResponse> {
    return this.userManager.registerUser(userData);
  }

  async checkUserExists(userId: string): Promise<N8NWebhookResponse> {
    return this.userManager.checkUserExists(userId);
  }

  async updateUserActivity(userId: string): Promise<void> {
    return this.userManager.updateUserActivity(userId);
  }

  async updateSubscription(userId: string, subscriptionData: SubscriptionUpdateData): Promise<N8NWebhookResponse> {
    return this.subscriptionManager.updateSubscription(userId, subscriptionData);
  }

  // Методы для отладки и управления Mock данными
  getAllUsers(): MockUserData[] {
    return this.userManager.getAllUsers();
  }

  clearAllData(): void {
    this.storageManager.validateMockAccess();
    
    try {
      // Очищаем localStorage
      this.storageManager.clearAllData();
      
      // Очищаем MockDataProvider
      this.mockDataProvider.clearMockData();
      
      this.logger.info('MockBackendService: Все данные очищены');
    } catch (error) {
      this.logger.error('MockBackendService: Ошибка очистки данных', { error });
    }
  }

  // Новые методы для работы с улучшенной системой
  getMockDataVersion(): string {
    return this.mockDataProvider.getDataSetVersion();
  }

  exportMockData() {
    this.storageManager.validateMockAccess();
    return this.mockDataProvider.exportMockData();
  }

  importMockData(dataSet: any) {
    this.storageManager.validateMockAccess();
    this.mockDataProvider.importMockData(dataSet);
    this.logger.info('MockBackendService: Mock данные импортированы');
  }
}

export default MockBackendService;
