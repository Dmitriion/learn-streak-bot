
import { TelegramMetrics, TelegramUser } from '../../types/TelegramTypes';
import LoggingService from '../LoggingService';
import { 
  isTelegramWebAppAvailable, 
  getTelegramWebApp, 
  isValidTelegramMetrics 
} from '../../utils/telegramTypeGuards';

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
    const webApp = getTelegramWebApp();
    if (!webApp) {
      this.logger.warn('Telegram WebApp API недоступен');
      return;
    }
    
    this.metrics = {
      user_id: userId,
      telegram_user_id: telegramUserId,
      app_version: this.getAppVersion(),
      platform: this.detectPlatform(),
      theme: webApp.colorScheme || 'light',
      viewport_height: this.getViewportHeight(),
      is_expanded: this.getIsExpanded(),
      haptic_feedback_enabled: !!webApp.HapticFeedback,
      back_button_clicks: 0,
      main_button_clicks: 0,
      settings_button_clicks: 0
    };

    // Валидируем созданные метрики
    if (!isValidTelegramMetrics(this.metrics)) {
      this.logger.error('Созданные метрики не прошли валидацию');
      this.metrics = null;
      return;
    }

    this.setupTelegramEventListeners();
    this.saveMetrics();
    
    this.logger.info('Telegram метрики инициализированы', this.metrics);
  }

  private getAppVersion(): string {
    const webApp = window.Telegram?.WebApp;
    if (webApp && 'version' in webApp && webApp.version) {
      return webApp.version;
    }
    return '1.0.0';
  }

  private getViewportHeight(): number {
    const webApp = window.Telegram?.WebApp;
    if (webApp && 'viewportHeight' in webApp && webApp.viewportHeight) {
      return webApp.viewportHeight;
    }
    return window.innerHeight;
  }

  private getIsExpanded(): boolean {
    const webApp = window.Telegram?.WebApp;
    if (webApp && 'isExpanded' in webApp) {
      return webApp.isExpanded || false;
    }
    return false;
  }

  private detectPlatform(): 'ios' | 'android' | 'web' {
    const webApp = window.Telegram?.WebApp;
    if (webApp && 'platform' in webApp && webApp.platform) {
      const platform = webApp.platform.toLowerCase();
      if (platform.includes('ios')) return 'ios';
      if (platform.includes('android')) return 'android';
    }
    
    // Fallback определение по User-Agent
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';
    if (userAgent.includes('android')) return 'android';
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

    // Отслеживаем изменения viewport (если доступно)
    webApp.onEvent('viewportChanged', () => {
      if (this.metrics) {
        this.metrics.viewport_height = this.getViewportHeight();
        this.metrics.is_expanded = this.getIsExpanded();
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
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      return isValidTelegramMetrics(parsed) ? parsed : null;
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
