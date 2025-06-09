
import { TelegramMetrics } from '../../types/TelegramTypes';
import LoggingService from '../LoggingService';
import { isValidTelegramMetrics } from '../../utils/telegramTypeGuards';

class TelegramAnalyticsStorage {
  private static instance: TelegramAnalyticsStorage;
  private logger: LoggingService;
  private readonly STORAGE_KEY = 'telegram_metrics';

  constructor() {
    this.logger = LoggingService.getInstance();
  }

  static getInstance(): TelegramAnalyticsStorage {
    if (!TelegramAnalyticsStorage.instance) {
      TelegramAnalyticsStorage.instance = new TelegramAnalyticsStorage();
    }
    return TelegramAnalyticsStorage.instance;
  }

  saveMetrics(metrics: TelegramMetrics): void {
    if (!isValidTelegramMetrics(metrics)) {
      this.logger.error('Попытка сохранить невалидные метрики', metrics);
      return;
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(metrics));
    } catch (error) {
      this.logger.error('Ошибка сохранения Telegram метрик', { error });
    }
  }

  getMetrics(): TelegramMetrics | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      return isValidTelegramMetrics(parsed) ? parsed : null;
    } catch (error) {
      this.logger.error('Ошибка загрузки Telegram метрик', { error });
      return null;
    }
  }

  clearMetrics(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      this.logger.debug('Telegram метрики очищены');
    } catch (error) {
      this.logger.error('Ошибка очистки Telegram метрик', { error });
    }
  }

  exportMetrics(): string | null {
    const metrics = this.getMetrics();
    if (!metrics) return null;

    try {
      return JSON.stringify(metrics, null, 2);
    } catch (error) {
      this.logger.error('Ошибка экспорта метрик', { error });
      return null;
    }
  }
}

export default TelegramAnalyticsStorage;
