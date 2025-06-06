
import { CloudStorageBase } from './storage/CloudStorageBase';
import { UserDataManager } from './storage/UserDataManager';
import { CloudStorageData } from './storage/types';

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

  // Делегируем специализированные методы UserDataManager
  async saveUserProgress(userId: string, progress: CloudStorageData['userProgress']): Promise<boolean> {
    return this.userDataManager.saveUserProgress(userId, progress);
  }

  async getUserProgress(userId: string): Promise<CloudStorageData['userProgress'] | null> {
    return this.userDataManager.getUserProgress(userId);
  }

  async saveUserPreferences(userId: string, preferences: CloudStorageData['userPreferences']): Promise<boolean> {
    return this.userDataManager.saveUserPreferences(userId, preferences);
  }

  async getUserPreferences(userId: string): Promise<CloudStorageData['userPreferences'] | null> {
    return this.userDataManager.getUserPreferences(userId);
  }

  async syncData(userId: string): Promise<boolean> {
    return this.userDataManager.syncData(userId);
  }
}

export default TelegramCloudStorage;
export { CloudStorageData } from './storage/types';
