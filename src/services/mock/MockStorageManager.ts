
import LoggingService from '../LoggingService';
import EnvironmentManager from '../environment/EnvironmentManager';
import { MockUserData } from './types';

class MockStorageManager {
  private logger: LoggingService;
  private environmentManager: EnvironmentManager;
  private localStorage_prefix = 'telegram_edu_app_';

  constructor() {
    this.logger = LoggingService.getInstance();
    this.environmentManager = EnvironmentManager.getInstance();
  }

  private getStorageKey(key: string): string {
    return `${this.localStorage_prefix}${key}`;
  }

  validateMockAccess(): void {
    if (!this.environmentManager.shouldUseMockData()) {
      this.logger.error('MockStorageManager: попытка доступа к mock данным в production');
      throw new Error('Mock данные недоступны в текущем режиме');
    }
  }

  saveUser(userData: MockUserData): void {
    this.validateMockAccess();
    
    try {
      localStorage.setItem(
        this.getStorageKey(`user_${userData.user_id}`),
        JSON.stringify(userData)
      );
      this.updateUsersList(userData.user_id);
    } catch (error) {
      this.logger.error('MockStorageManager: Ошибка сохранения пользователя', { error, userId: userData.user_id });
      throw error;
    }
  }

  getUser(userId: string): MockUserData | null {
    this.validateMockAccess();
    
    try {
      const userData = localStorage.getItem(this.getStorageKey(`user_${userId}`));
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      this.logger.error('MockStorageManager: Ошибка получения пользователя', { error, userId });
      return null;
    }
  }

  updateUser(userId: string, updates: Partial<MockUserData>): MockUserData | null {
    this.validateMockAccess();
    
    try {
      const existingUser = this.getUser(userId);
      if (!existingUser) {
        return null;
      }

      const updatedUser = { ...existingUser, ...updates };
      this.saveUser(updatedUser);
      return updatedUser;
    } catch (error) {
      this.logger.error('MockStorageManager: Ошибка обновления пользователя', { error, userId });
      return null;
    }
  }

  private updateUsersList(userId: string): void {
    try {
      const existingUsers = localStorage.getItem(this.getStorageKey('users_list'));
      const usersList: string[] = existingUsers ? JSON.parse(existingUsers) : [];
      
      if (!usersList.includes(userId)) {
        usersList.push(userId);
        localStorage.setItem(this.getStorageKey('users_list'), JSON.stringify(usersList));
      }
    } catch (error) {
      this.logger.error('MockStorageManager: Ошибка обновления списка пользователей', { error });
    }
  }

  clearAllData(): void {
    this.validateMockAccess();
    
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.localStorage_prefix)) {
          localStorage.removeItem(key);
        }
      });
      this.logger.info('MockStorageManager: Все данные очищены');
    } catch (error) {
      this.logger.error('MockStorageManager: Ошибка очистки данных', { error });
    }
  }
}

export default MockStorageManager;
