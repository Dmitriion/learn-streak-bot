
import CloudStorageBase from './storage/CloudStorageBase';
import { UserDataManager } from './storage/UserDataManager';
import { CloudStorageData } from '../types/metrics';

class TelegramCloudStorage extends CloudStorageBase {
  private static instance: TelegramCloudStorage;
  private userDataManager: UserDataManager;

  constructor() {
    super();
    this.userDataManager = UserDataManager.getInstance();
  }

  static getInstance(): TelegramCloudStorage {
    if (!TelegramCloudStorage.instance) {
      TelegramCloudStorage.instance = new TelegramCloudStorage();
    }
    return TelegramCloudStorage.instance;
  }

  // Реализация абстрактных методов базового класса
  protected async saveToCloud(key: string, data: CloudStorageData): Promise<boolean> {
    if (window.Telegram?.WebApp?.CloudStorage) {
      return new Promise((resolve) => {
        window.Telegram.WebApp.CloudStorage.setItem(key, JSON.stringify(data), (error) => {
          if (error) {
            this.logger.error('Ошибка сохранения в CloudStorage', { error, key });
            resolve(false);
          } else {
            resolve(true);
          }
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
              this.logger.error('Ошибка парсинга CloudStorage данных', { parseError, key });
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
          if (error || !result) {
            resolve([]);
          } else {
            resolve(result);
          }
        });
      });
    }
    return [];
  }

  // Делегируем специализированные методы UserDataManager
  async saveUserProgress(userId: string, progress: any): Promise<boolean> {
    return this.userDataManager.saveUserProgress(userId, progress);
  }

  async getUserProgress(userId: string): Promise<any> {
    return this.userDataManager.getUserProgress(userId);
  }

  async saveUserPreferences(userId: string, preferences: any): Promise<boolean> {
    return this.userDataManager.saveUserPreferences(userId, preferences);
  }

  async getUserPreferences(userId: string): Promise<any> {
    return this.userDataManager.getUserPreferences(userId);
  }

  async syncData(userId: string): Promise<boolean> {
    return this.userDataManager.syncData(userId);
  }
}

export default TelegramCloudStorage;
export type { CloudStorageData } from '../types/metrics';
