
import { TelegramMetrics } from '../../types/analytics';
import LoggingService from '../LoggingService';

class TelegramAnalytics {
  private static instance: TelegramAnalytics;
  private logger: LoggingService;
  private metrics: TelegramMetrics | null = null;

  constructor() {
    this.logger = LoggingService.getInstance();
  }

  static getInstance(): TelegramAnalytics {
    if (!TelegramAnalytics.instance) {
      TelegramAnalytics.instance = new TelegramAnalytics();
    }
    return TelegramAnalytics.instance;
  }

  initializeTelegramMetrics(userId: string, telegramUserId: number) {
    if (!window.Telegram?.WebApp) {
      this.logger.warn('Telegram WebApp API недоступен');
      return;
    }

    const webApp = window.Telegram.WebApp;
    
    this.metrics = {
      user_id: userId,
      telegram_user_id: telegramUserId,
      app_version: webApp.version || '1.0.0',
      platform: this.detectPlatform(),
      theme: webApp.colorScheme || 'light',
      viewport_height: webApp.viewportHeight || window.innerHeight,
      is_expanded: webApp.isExpanded || false,
      haptic_feedback_enabled: !!webApp.HapticFeedback,
      back_button_clicks: 0,
      main_button_clicks: 0,
      settings_button_clicks: 0
    };

    this.setupTelegramEventListeners();
    this.saveMetrics();
    
    this.logger.info('Telegram метрики инициализированы', this.metrics);
  }

  private detectPlatform(): 'ios' | 'android' | 'web' {
    if (!window.Telegram?.WebApp?.platform) {
      return 'web';
    }
    
    const platform = window.Telegram.WebApp.platform.toLowerCase();
    if (platform.includes('ios')) return 'ios';
    if (platform.includes('android')) return 'android';
    return 'web';
  }

  private setupTelegramEventListeners() {
    if (!window.Telegram?.WebApp || !this.metrics) return;

    const webApp = window.Telegram.WebApp;

    // Отслеживаем клики по кнопкам Telegram
    if (webApp.BackButton) {
      webApp.BackButton.onClick(() => {
        this.metrics!.back_button_clicks++;
        this.saveMetrics();
        this.logger.debug('Нажата кнопка Назад в Telegram');
      });
    }

    if (webApp.MainButton) {
      webApp.MainButton.onClick(() => {
        this.metrics!.main_button_clicks++;
        this.saveMetrics();
        this.logger.debug('Нажата главная кнопка в Telegram');
      });
    }

    if (webApp.SettingsButton) {
      webApp.SettingsButton.onClick(() => {
        this.metrics!.settings_button_clicks++;
        this.saveMetrics();
        this.logger.debug('Нажата кнопка настроек в Telegram');
      });
    }

    // Отслеживаем изменения viewport
    webApp.onEvent('viewportChanged', () => {
      if (this.metrics) {
        this.metrics.viewport_height = webApp.viewportHeight || window.innerHeight;
        this.metrics.is_expanded = webApp.isExpanded || false;
        this.saveMetrics();
      }
    });

    // Отслеживаем изменения темы
    webApp.onEvent('themeChanged', () => {
      if (this.metrics) {
        this.metrics.theme = webApp.colorScheme || 'light';
        this.saveMetrics();
      }
    });
  }

  trackHapticFeedback(type: 'light' | 'medium' | 'heavy' | 'error' | 'success' | 'warning') {
    if (!window.Telegram?.WebApp?.HapticFeedback) return;

    try {
      const hapticFeedback = window.Telegram.WebApp.HapticFeedback;
      
      switch (type) {
        case 'light':
        case 'medium':
        case 'heavy':
          hapticFeedback.impactOccurred(type);
          break;
        case 'error':
        case 'success':
        case 'warning':
          hapticFeedback.notificationOccurred(type);
          break;
      }
      
      this.logger.debug('Haptic feedback triggered', { type });
    } catch (error) {
      this.logger.error('Ошибка haptic feedback', { error, type });
    }
  }

  updateTheme(theme: 'light' | 'dark') {
    if (this.metrics) {
      this.metrics.theme = theme;
      this.saveMetrics();
    }
  }

  private saveMetrics() {
    if (!this.metrics) return;

    try {
      localStorage.setItem('telegram_metrics', JSON.stringify(this.metrics));
    } catch (error) {
      this.logger.error('Ошибка сохранения Telegram метрик', { error });
    }
  }

  getTelegramMetrics(): TelegramMetrics | null {
    try {
      const data = localStorage.getItem('telegram_metrics');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error('Ошибка загрузки Telegram метрик', { error });
      return null;
    }
  }

  getUsageAnalytics() {
    const metrics = this.getTelegramMetrics();
    if (!metrics) return null;

    return {
      platform_distribution: { [metrics.platform]: 1 },
      theme_preference: metrics.theme,
      button_usage: {
        back_button: metrics.back_button_clicks,
        main_button: metrics.main_button_clicks,
        settings_button: metrics.settings_button_clicks
      },
      viewport_stats: {
        average_height: metrics.viewport_height,
        is_expanded: metrics.is_expanded
      },
      features_available: {
        haptic_feedback: metrics.haptic_feedback_enabled
      }
    };
  }
}

export default TelegramAnalytics;
