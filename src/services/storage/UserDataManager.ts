
import CloudStorageBase from './CloudStorageBase';
import { CloudStorageData } from '../../types/metrics';
import ErrorService from '../ErrorService';

export class UserDataManager extends CloudStorageBase {
  private static instance: UserDataManager;
  private errorService: ErrorService;

  constructor() {
    super();
    this.errorService = ErrorService.getInstance();
  }

  static getInstance(): UserDataManager {
    if (!UserDataManager.instance) {
      UserDataManager.instance = new UserDataManager();
    }
    return UserDataManager.instance;
  }

  // Реализация абстрактных методов базового класса
  protected async saveToCloud(key: string, data: CloudStorageData): Promise<boolean> {
    if (window.Telegram?.WebApp?.CloudStorage) {
      return new Promise((resolve) => {
        window.Telegram.WebApp.CloudStorage.setItem(key, JSON.stringify(data), (error) => {
          resolve(!error);
        });
      });
    }
    return false;
  }

  protected async loadFromCloud(key: string): Promise<CloudStorageData | null> {
    if (window.Telegram?.WebApp?.CloudStorage) {
      return new Promise((resolve) => {
        window.Telegram.WebApp.CloudStorage.getItem(key, (error, result) => {
          if (error || !result) {
            resolve(null);
          } else {
            try {
              resolve(JSON.parse(result));
            } catch (parseError) {
              resolve(null);
            }
          }
        });
      });
    }
    return null;
  }

  protected async removeFromCloud(key: string): Promise<boolean> {
    if (window.Telegram?.WebApp?.CloudStorage) {
      return new Promise((resolve) => {
        window.Telegram.WebApp.CloudStorage.removeItem(key, (error) => {
          resolve(!error);
        });
      });
    }
    return false;
  }

  protected async getCloudKeys(): Promise<string[]> {
    if (window.Telegram?.WebApp?.CloudStorage) {
      return new Promise((resolve) => {
        window.Telegram.WebApp.CloudStorage.getKeys((error, result) => {
          resolve(result || []);
        });
      });
    }
    return [];
  }

  async saveUserProgress(userId: string, progress: any): Promise<boolean> {
    return this.setItem(`user_progress_${userId}`, progress);
  }

  async getUserProgress(userId: string): Promise<any> {
    return this.getItem(`user_progress_${userId}`);
  }

  async saveUserPreferences(userId: string, preferences: any): Promise<boolean> {
    return this.setItem(`user_preferences_${userId}`, preferences);
  }

  async getUserPreferences(userId: string): Promise<any> {
    const defaultPreferences = {
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
      
      const keys = await this.getKeys();
      const userKeys = keys.filter(key => key.includes(userId));
      
      for (const key of userKeys) {
        const cloudData = await this.getItem(key);
        if (cloudData) {
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
