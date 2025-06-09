
import LoggingService from '../LoggingService';
import EnvironmentManager from '../environment/EnvironmentManager';
import { MockDataFactory } from './MockDataFactory';
import { MockDataManager } from './MockDataManager';
import { MockDataSet, MockUserData, MockLessonData, MockSettingsData } from './MockDataTypes';

class MockDataProvider {
  private static instance: MockDataProvider;
  private logger: LoggingService;
  private environmentManager: EnvironmentManager;
  private dataManager: MockDataManager;

  constructor() {
    this.logger = LoggingService.getInstance();
    this.environmentManager = EnvironmentManager.getInstance();
    this.dataManager = new MockDataManager(MockDataFactory.createDefaultDataSet());
  }

  static getInstance(): MockDataProvider {
    if (!MockDataProvider.instance) {
      MockDataProvider.instance = new MockDataProvider();
    }
    return MockDataProvider.instance;
  }

  isEnabled(): boolean {
    return this.environmentManager.shouldUseMockData();
  }

  getUserData(): MockUserData[] {
    if (!this.isEnabled()) {
      this.logger.warn('MockDataProvider: попытка получить mock данные в production');
      return [];
    }
    return this.dataManager.getUsers();
  }

  getLessonsData(): MockLessonData[] {
    if (!this.isEnabled()) {
      this.logger.warn('MockDataProvider: попытка получить mock уроки в production');
      return [];
    }
    return this.dataManager.getLessons();
  }

  getSettingsData(): MockSettingsData {
    if (!this.isEnabled()) {
      this.logger.warn('MockDataProvider: попытка получить mock настройки в production');
      return {
        webhook_url: '',
        automation_enabled: false,
        notifications_enabled: false
      };
    }
    return this.dataManager.getSettings();
  }

  addMockUser(userData: Partial<MockUserData>): MockUserData {
    if (!this.isEnabled()) {
      throw new Error('Mock данные недоступны в production');
    }

    return this.dataManager.addUser(userData);
  }

  updateMockUser(userId: string, updates: Partial<MockUserData>): MockUserData | null {
    if (!this.isEnabled()) {
      throw new Error('Mock данные недоступны в production');
    }

    return this.dataManager.updateUser(userId, updates);
  }

  clearMockData() {
    if (!this.isEnabled()) {
      throw new Error('Mock данные недоступны в production');
    }

    this.dataManager.resetData(MockDataFactory.createDefaultDataSet());
    this.logger.info('MockDataProvider: mock данные очищены');
  }

  getDataSetVersion(): string {
    return this.dataManager.getVersion();
  }

  exportMockData(): MockDataSet {
    if (!this.isEnabled()) {
      throw new Error('Mock данные недоступны в production');
    }

    return this.dataManager.exportData();
  }

  importMockData(dataSet: MockDataSet) {
    if (!this.isEnabled()) {
      throw new Error('Mock данные недоступны в production');
    }

    this.dataManager.importData(dataSet);
  }
}

export default MockDataProvider;
