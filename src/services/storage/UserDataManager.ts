
import { CloudStorageBase } from './CloudStorageBase';
import { CloudStorageData } from './types';

export class UserDataManager extends CloudStorageBase {
  private static instance: UserDataManager;

  static getInstance(): UserDataManager {
    if (!UserDataManager.instance) {
      UserDataManager.instance = new UserDataManager();
    }
    return UserDataManager.instance;
  }

  async saveUserProgress(userId: string, progress: CloudStorageData['userProgress']): Promise<boolean> {
    return this.setItem(`user_progress_${userId}`, progress);
  }

  async getUserProgress(userId: string): Promise<CloudStorageData['userProgress'] | null> {
    return this.getItem(`user_progress_${userId}`);
  }

  async saveUserPreferences(userId: string, preferences: CloudStorageData['userPreferences']): Promise<boolean> {
    return this.setItem(`user_preferences_${userId}`, preferences);
  }

  async getUserPreferences(userId: string): Promise<CloudStorageData['userPreferences'] | null> {
    const defaultPreferences: CloudStorageData['userPreferences'] = {
      theme: 'light',
      notifications: true,
      language: 'ru'
    };
    
    const saved = await this.getItem(`user_preferences_${userId}`);
    return saved || defaultPreferences;
  }

  async syncData(userId: string): Promise<boolean> {
    try {
      this.logger.info('Начало синхронизации данных CloudStorage', { userId });
      
      // Получаем все ключи и синхронизируем между CloudStorage и localStorage
      const keys = await this.getKeys();
      const userKeys = keys.filter(key => key.includes(userId));
      
      for (const key of userKeys) {
        const cloudData = await this.getItem(key);
        if (cloudData) {
          // Обновляем localStorage данными из облака
          this.fallbackToLocalStorage(key, JSON.stringify(cloudData));
        }
      }
      
      this.logger.info('Синхронизация данных завершена', { userId, keysCount: userKeys.length });
      return true;
    } catch (error) {
      this.errorService.handleError({
        category: 'telegram',
        message: 'Ошибка синхронизации CloudStorage',
        originalError: error as Error,
        context: { userId },
        recoverable: true
      });
      return false;
    }
  }
}
