
import LoggingService from './LoggingService';
import ErrorService from './ErrorService';

export interface CloudStorageData {
  userProgress: {
    currentLesson: number;
    completedLessons: number[];
    score: number;
    lastActivity: string;
  };
  userPreferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
  offlineCache: {
    lessonsData: any[];
    lastSync: string;
  };
}

class TelegramCloudStorage {
  private static instance: TelegramCloudStorage;
  private logger: LoggingService;
  private errorService: ErrorService;
  private isAvailable: boolean = false;

  constructor() {
    this.logger = LoggingService.getInstance();
    this.errorService = ErrorService.getInstance();
    this.checkAvailability();
  }

  static getInstance(): TelegramCloudStorage {
    if (!TelegramCloudStorage.instance) {
      TelegramCloudStorage.instance = new TelegramCloudStorage();
    }
    return TelegramCloudStorage.instance;
  }

  private checkAvailability() {
    this.isAvailable = !!(window.Telegram?.WebApp?.CloudStorage);
    
    if (!this.isAvailable) {
      this.logger.warn('Telegram CloudStorage недоступен, используем localStorage');
    } else {
      this.logger.info('Telegram CloudStorage доступен');
    }
  }

  async setItem(key: string, value: any): Promise<boolean> {
    try {
      const serializedValue = JSON.stringify(value);
      
      if (this.isAvailable && window.Telegram?.WebApp?.CloudStorage) {
        return new Promise((resolve) => {
          window.Telegram.WebApp.CloudStorage.setItem(key, serializedValue, (error) => {
            if (error) {
              this.logger.error('Ошибка записи в CloudStorage', { key, error });
              this.fallbackToLocalStorage(key, serializedValue);
              resolve(false);
            } else {
              this.logger.debug('Данные записаны в CloudStorage', { key });
              resolve(true);
            }
          });
        });
      } else {
        this.fallbackToLocalStorage(key, serializedValue);
        return true;
      }
    } catch (error) {
      this.errorService.handleError({
        category: 'telegram',
        message: 'Ошибка сохранения в CloudStorage',
        originalError: error as Error,
        context: { key },
        recoverable: true
      });
      return false;
    }
  }

  async getItem(key: string): Promise<any> {
    try {
      if (this.isAvailable && window.Telegram?.WebApp?.CloudStorage) {
        return new Promise((resolve) => {
          window.Telegram.WebApp.CloudStorage.getItem(key, (error, value) => {
            if (error) {
              this.logger.error('Ошибка чтения из CloudStorage', { key, error });
              resolve(this.fallbackFromLocalStorage(key));
            } else {
              try {
                const parsed = value ? JSON.parse(value) : null;
                this.logger.debug('Данные получены из CloudStorage', { key });
                resolve(parsed);
              } catch (parseError) {
                this.logger.error('Ошибка парсинга данных CloudStorage', { key, parseError });
                resolve(this.fallbackFromLocalStorage(key));
              }
            }
          });
        });
      } else {
        return this.fallbackFromLocalStorage(key);
      }
    } catch (error) {
      this.errorService.handleError({
        category: 'telegram',
        message: 'Ошибка получения из CloudStorage',
        originalError: error as Error,
        context: { key },
        recoverable: true
      });
      return null;
    }
  }

  async removeItem(key: string): Promise<boolean> {
    try {
      if (this.isAvailable && window.Telegram?.WebApp?.CloudStorage) {
        return new Promise((resolve) => {
          window.Telegram.WebApp.CloudStorage.removeItem(key, (error) => {
            if (error) {
              this.logger.error('Ошибка удаления из CloudStorage', { key, error });
            } else {
              this.logger.debug('Данные удалены из CloudStorage', { key });
            }
            localStorage.removeItem(`tg_${key}`);
            resolve(!error);
          });
        });
      } else {
        localStorage.removeItem(`tg_${key}`);
        return true;
      }
    } catch (error) {
      this.errorService.handleError({
        category: 'telegram',
        message: 'Ошибка удаления из CloudStorage',
        originalError: error as Error,
        context: { key },
        recoverable: true
      });
      return false;
    }
  }

  async getKeys(): Promise<string[]> {
    try {
      if (this.isAvailable && window.Telegram?.WebApp?.CloudStorage) {
        return new Promise((resolve) => {
          window.Telegram.WebApp.CloudStorage.getKeys((error, keys) => {
            if (error) {
              this.logger.error('Ошибка получения ключей CloudStorage', { error });
              resolve(this.getLocalStorageKeys());
            } else {
              resolve(keys || []);
            }
          });
        });
      } else {
        return this.getLocalStorageKeys();
      }
    } catch (error) {
      this.errorService.handleError({
        category: 'telegram',
        message: 'Ошибка получения ключей CloudStorage',
        originalError: error as Error,
        recoverable: true
      });
      return [];
    }
  }

  private fallbackToLocalStorage(key: string, value: string) {
    try {
      localStorage.setItem(`tg_${key}`, value);
      this.logger.debug('Данные сохранены в localStorage как fallback', { key });
    } catch (error) {
      this.logger.error('Ошибка записи в localStorage fallback', { key, error });
    }
  }

  private fallbackFromLocalStorage(key: string): any {
    try {
      const value = localStorage.getItem(`tg_${key}`);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error('Ошибка чтения localStorage fallback', { key, error });
      return null;
    }
  }

  private getLocalStorageKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('tg_')) {
        keys.push(key.substring(3));
      }
    }
    return keys;
  }

  // Специализированные методы для образовательной платформы
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

export default TelegramCloudStorage;
