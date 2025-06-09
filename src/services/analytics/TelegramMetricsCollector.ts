
import { TelegramMetrics } from '../../types/TelegramTypes';
import LoggingService from '../LoggingService';
import { 
  getTelegramWebApp, 
  isValidTelegramMetrics 
} from '../../utils/telegramTypeGuards';

class TelegramMetricsCollector {
  private static instance: TelegramMetricsCollector;
  private logger: LoggingService;

  constructor() {
    this.logger = LoggingService.getInstance();
  }

  static getInstance(): TelegramMetricsCollector {
    if (!TelegramMetricsCollector.instance) {
      TelegramMetricsCollector.instance = new TelegramMetricsCollector();
    }
    return TelegramMetricsCollector.instance;
  }

  initializeMetrics(userId: string, telegramUserId: number): TelegramMetrics | null {
    const webApp = getTelegramWebApp();
    if (!webApp) {
      this.logger.warn('Telegram WebApp API недоступен');
      return null;
    }
    
    const metrics: TelegramMetrics = {
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

    if (!isValidTelegramMetrics(metrics)) {
      this.logger.error('Созданные метрики не прошли валидацию');
      return null;
    }

    this.logger.info('Telegram метрики инициализированы', metrics);
    return metrics;
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
    
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';
    if (userAgent.includes('android')) return 'android';
    return 'web';
  }

  updateMetricsViewport(metrics: TelegramMetrics): TelegramMetrics {
    return {
      ...metrics,
      viewport_height: this.getViewportHeight(),
      is_expanded: this.getIsExpanded()
    };
  }

  updateMetricsTheme(metrics: TelegramMetrics, theme: 'light' | 'dark'): TelegramMetrics {
    return {
      ...metrics,
      theme
    };
  }
}

export default TelegramMetricsCollector;
