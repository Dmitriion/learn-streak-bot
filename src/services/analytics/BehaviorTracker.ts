
import { BehaviorMetrics } from '../../types/analytics';
import LoggingService from '../LoggingService';

class BehaviorTracker {
  private static instance: BehaviorTracker;
  private logger: LoggingService;
  private isTracking: boolean = false;
  private currentSessionId: string = '';
  private startTime: number = 0;

  constructor() {
    this.logger = LoggingService.getInstance();
  }

  static getInstance(): BehaviorTracker {
    if (!BehaviorTracker.instance) {
      BehaviorTracker.instance = new BehaviorTracker();
    }
    return BehaviorTracker.instance;
  }

  startTracking(userId: string) {
    if (this.isTracking) return;

    this.currentSessionId = `${userId}_${Date.now()}`;
    this.startTime = Date.now();
    this.isTracking = true;

    this.setupEventListeners(userId);
    this.logger.info('Отслеживание поведения запущено', { userId, sessionId: this.currentSessionId });
  }

  stopTracking() {
    if (!this.isTracking) return;

    this.removeEventListeners();
    this.isTracking = false;
    this.logger.info('Отслеживание поведения остановлено');
  }

  private setupEventListeners(userId: string) {
    const trackEvent = (actionType: 'click' | 'scroll' | 'focus' | 'blur' | 'navigation', element?: Element) => {
      if (!this.isTracking) return;

      const metric: BehaviorMetrics = {
        user_id: userId,
        session_id: this.currentSessionId,
        page_path: window.location.pathname,
        action_type: actionType,
        element_id: element?.id,
        timestamp: new Date().toISOString(),
        duration_ms: Date.now() - this.startTime,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight
      };

      this.saveMetric(metric);
    };

    // Отслеживание кликов
    document.addEventListener('click', (e) => {
      trackEvent('click', e.target as Element);
    });

    // Отслеживание скролла
    document.addEventListener('scroll', () => {
      trackEvent('scroll');
    });

    // Отслеживание фокуса
    window.addEventListener('focus', () => {
      trackEvent('focus');
    });

    window.addEventListener('blur', () => {
      trackEvent('blur');
    });

    // Отслеживание навигации
    window.addEventListener('popstate', () => {
      trackEvent('navigation');
    });
  }

  private removeEventListeners() {
    // В реальном приложении здесь были бы removeEventListener
    // Для упрощения пропускаем, так как обработчики анонимные
  }

  private saveMetric(metric: BehaviorMetrics) {
    try {
      const existingData = localStorage.getItem('behavior_metrics') || '[]';
      const metricsArray = JSON.parse(existingData);
      metricsArray.push(metric);
      
      // Храним только последние 1000 записей
      if (metricsArray.length > 1000) {
        metricsArray.splice(0, metricsArray.length - 1000);
      }
      
      localStorage.setItem('behavior_metrics', JSON.stringify(metricsArray));
    } catch (error) {
      this.logger.error('Ошибка сохранения метрик поведения', { error });
    }
  }

  getBehaviorMetrics(userId: string, hours: number = 24): BehaviorMetrics[] {
    try {
      const data = localStorage.getItem('behavior_metrics') || '[]';
      const allMetrics = JSON.parse(data) as BehaviorMetrics[];
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - hours);

      return allMetrics.filter(metric => 
        metric.user_id === userId && 
        new Date(metric.timestamp) > cutoffDate
      );
    } catch (error) {
      this.logger.error('Ошибка загрузки метрик поведения', { error });
      return [];
    }
  }
}

export default BehaviorTracker;
