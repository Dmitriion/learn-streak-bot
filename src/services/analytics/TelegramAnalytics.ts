
import { TelegramMetrics } from '../../types/TelegramTypes';
import LoggingService from '../LoggingService';
import TelegramMetricsCollector from './TelegramMetricsCollector';
import TelegramEventTracker from './TelegramEventTracker';
import TelegramHapticService from './TelegramHapticService';
import TelegramAnalyticsStorage from './TelegramAnalyticsStorage';

class TelegramAnalytics {
  private static instance: TelegramAnalytics;
  private logger: LoggingService;
  private metricsCollector: TelegramMetricsCollector;
  private eventTracker: TelegramEventTracker;
  private hapticService: TelegramHapticService;
  private storage: TelegramAnalyticsStorage;

  constructor() {
    this.logger = LoggingService.getInstance();
    this.metricsCollector = TelegramMetricsCollector.getInstance();
    this.eventTracker = TelegramEventTracker.getInstance();
    this.hapticService = TelegramHapticService.getInstance();
    this.storage = TelegramAnalyticsStorage.getInstance();
  }

  static getInstance(): TelegramAnalytics {
    if (!TelegramAnalytics.instance) {
      TelegramAnalytics.instance = new TelegramAnalytics();
    }
    return TelegramAnalytics.instance;
  }

  initializeTelegramMetrics(userId: string, telegramUserId: number): void {
    const metrics = this.metricsCollector.initializeMetrics(userId, telegramUserId);
    if (!metrics) return;

    this.storage.saveMetrics(metrics);
    this.eventTracker.setupEventListeners(metrics);
  }

  trackHapticFeedback(type: 'light' | 'medium' | 'heavy' | 'error' | 'success' | 'warning'): void {
    this.hapticService.triggerHapticFeedback(type);
  }

  updateTheme(theme: 'light' | 'dark'): void {
    const metrics = this.storage.getMetrics();
    if (metrics) {
      const updatedMetrics = this.metricsCollector.updateMetricsTheme(metrics, theme);
      this.storage.saveMetrics(updatedMetrics);
    }
  }

  getTelegramMetrics(): TelegramMetrics | null {
    return this.storage.getMetrics();
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

  clearAnalytics(): void {
    this.storage.clearMetrics();
  }

  exportAnalytics(): string | null {
    return this.storage.exportMetrics();
  }
}

export default TelegramAnalytics;
