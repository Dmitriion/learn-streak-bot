
import LoggingService from '../LoggingService';
import { CloudStorageData } from '../../types/metrics';
import { hasCloudStorage } from '../../utils/telegramTypeGuards';

export abstract class CloudStorageBase {
  protected logger: LoggingService;

  constructor() {
    this.logger = LoggingService.getInstance();
  }

  protected isCloudStorageAvailable(): boolean {
    return hasCloudStorage();
  }

  // Основные методы для работы с облачным хранилищем
  async save(key: string, data: CloudStorageData): Promise<boolean> {
    try {
      if (this.isCloudStorageAvailable()) {
        return await this.saveToCloud(key, data);
      } else {
        return this.saveToLocalStorage(key, data);
      }
    } catch (error) {
      this.logger.error('Ошибка сохранения данных', { error, key });
      return this.saveToLocalStorage(key, data);
    }
  }

  async load(key: string): Promise<CloudStorageData | null> {
    try {
      if (this.isCloudStorageAvailable()) {
        return await this.loadFromCloud(key);
      } else {
        return this.loadFromLocalStorage(key);
      }
    } catch (error) {
      this.logger.error('Ошибка загрузки данных', { error, key });
      return this.loadFromLocalStorage(key);
    }
  }

  async remove(key: string): Promise<boolean> {
    try {
      if (this.isCloudStorageAvailable()) {
        return await this.removeFromCloud(key);
      } else {
        return this.removeFromLocalStorage(key);
      }
    } catch (error) {
      this.logger.error('Ошибка удаления данных', { error, key });
      return this.removeFromLocalStorage(key);
    }
  }

  // Методы для совместимости с старым API
  async setItem(key: string, data: any): Promise<boolean> {
    return this.save(key, data);
  }

  async getItem(key: string): Promise<any> {
    return this.load(key);
  }

  async getKeys(): Promise<string[]> {
    try {
      if (this.isCloudStorageAvailable()) {
        return await this.getCloudKeys();
      } else {
        return this.getLocalStorageKeys();
      }
    } catch (error) {
      this.logger.error('Ошибка получения ключей', { error });
      return this.getLocalStorageKeys();
    }
  }

  // Абстрактные методы для реализации в наследниках
  protected abstract saveToCloud(key: string, data: CloudStorageData): Promise<boolean>;
  protected abstract loadFromCloud(key: string): Promise<CloudStorageData | null>;
  protected abstract removeFromCloud(key: string): Promise<boolean>;
  protected abstract getCloudKeys(): Promise<string[]>;

  // Fallback методы для localStorage
  private saveToLocalStorage(key: string, data: CloudStorageData): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      this.logger.debug('Данные сохранены в localStorage', { key });
      return true;
    } catch (error) {
      this.logger.error('Ошибка сохранения в localStorage', { error, key });
      return false;
    }
  }

  private loadFromLocalStorage(key: string): CloudStorageData | null {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        this.logger.debug('Данные загружены из localStorage', { key });
        return parsed as CloudStorageData;
      }
      return null;
    } catch (error) {
      this.logger.error('Ошибка загрузки из localStorage', { error, key });
      return null;
    }
  }

  private removeFromLocalStorage(key: string): boolean {
    try {
      localStorage.removeItem(key);
      this.logger.debug('Данные удалены из localStorage', { key });
      return true;
    } catch (error) {
      this.logger.error('Ошибка удаления из localStorage', { error, key });
      return false;
    }
  }

  private getLocalStorageKeys(): string[] {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      this.logger.error('Ошибка получения ключей localStorage', { error });
      return [];
    }
  }

  // Метод для fallback на localStorage (для совместимости)
  protected fallbackToLocalStorage(key: string, data: string): boolean {
    try {
      localStorage.setItem(key, data);
      return true;
    } catch (error) {
      this.logger.error('Fallback localStorage ошибка', { error, key });
      return false;
    }
  }
}

export default CloudStorageBase;
