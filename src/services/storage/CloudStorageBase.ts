
import LoggingService from '../LoggingService';
import { CloudStorageData } from '../../types/metrics';
import { hasCloudStorage } from '../../utils/telegramTypeGuards';

abstract class CloudStorageBase {
  protected logger: LoggingService;

  constructor() {
    this.logger = LoggingService.getInstance();
  }

  /**
   * Проверка доступности облачного хранилища
   */
  protected isCloudStorageAvailable(): boolean {
    return hasCloudStorage();
  }

  /**
   * Безопасное сохранение данных с fallback
   */
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

  /**
   * Безопасная загрузка данных с fallback
   */
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

  /**
   * Абстрактные методы для реализации в наследниках
   */
  protected abstract saveToCloud(key: string, data: CloudStorageData): Promise<boolean>;
  protected abstract loadFromCloud(key: string): Promise<CloudStorageData | null>;

  /**
   * Fallback методы для localStorage
   */
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

  /**
   * Удаление данных
   */
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

  protected abstract removeFromCloud(key: string): Promise<boolean>;

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
}

export default CloudStorageBase;
