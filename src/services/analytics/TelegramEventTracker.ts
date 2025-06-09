
import { TelegramMetrics } from '../../types/TelegramTypes';
import LoggingService from '../LoggingService';
import TelegramAnalyticsStorage from './TelegramAnalyticsStorage';

class TelegramEventTracker {
  private static instance: TelegramEventTracker;
  private logger: LoggingService;
  private storage: TelegramAnalyticsStorage;

  constructor() {
    this.logger = LoggingService.getInstance();
    this.storage = TelegramAnalyticsStorage.getInstance();
  }

  static getInstance(): TelegramEventTracker {
    if (!TelegramEventTracker.instance) {
      TelegramEventTracker.instance = new TelegramEventTracker();
    }
    return TelegramEventTracker.instance;
  }

  setupEventListeners(metrics: TelegramMetrics): void {
    if (!window.Telegram?.WebApp) return;

    const webApp = window.Telegram.WebApp;

    // Отслеживаем клики по кнопкам Telegram
    if (webApp.BackButton) {
      webApp.BackButton.onClick(() => {
        const updatedMetrics = {
          ...metrics,
          back_button_clicks: metrics.back_button_clicks + 1
        };
        this.storage.saveMetrics(updatedMetrics);
        this.logger.debug('Нажата кнопка Назад в Telegram');
      });
    }

    if (webApp.MainButton) {
      webApp.MainButton.onClick(() => {
        const updatedMetrics = {
          ...metrics,
          main_button_clicks: metrics.main_button_clicks + 1
        };
        this.storage.saveMetrics(updatedMetrics);
        this.logger.debug('Нажата главная кнопка в Telegram');
      });
    }

    // Отслеживаем изменения viewport
    webApp.onEvent('viewportChanged', () => {
      const currentMetrics = this.storage.getMetrics();
      if (currentMetrics) {
        const updatedMetrics = {
          ...currentMetrics,
          viewport_height: window.Telegram?.WebApp?.viewportHeight || window.innerHeight,
          is_expanded: window.Telegram?.WebApp?.isExpanded || false
        };
        this.storage.saveMetrics(updatedMetrics);
      }
    });

    // Отслеживаем изменения темы
    webApp.onEvent('themeChanged', () => {
      const currentMetrics = this.storage.getMetrics();
      if (currentMetrics) {
        const updatedMetrics = {
          ...currentMetrics,
          theme: webApp.colorScheme || 'light'
        };
        this.storage.saveMetrics(updatedMetrics);
      }
    });
  }

  incrementButtonClick(buttonType: 'back' | 'main' | 'settings'): void {
    const metrics = this.storage.getMetrics();
    if (!metrics) return;

    const fieldMap = {
      back: 'back_button_clicks',
      main: 'main_button_clicks',
      settings: 'settings_button_clicks'
    } as const;

    const field = fieldMap[buttonType];
    const updatedMetrics = {
      ...metrics,
      [field]: metrics[field] + 1
    };

    this.storage.saveMetrics(updatedMetrics);
  }
}

export default TelegramEventTracker;
