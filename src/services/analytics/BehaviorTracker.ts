
import { BehaviorMetrics } from '../../types/analytics';
import LoggingService from '../LoggingService';

class BehaviorTracker {
  private static instance: BehaviorTracker;
  private logger: LoggingService;
  private sessionId: string;
  private isTracking: boolean = false;
  private eventQueue: BehaviorMetrics[] = [];

  constructor() {
    this.logger = LoggingService.getInstance();
    this.sessionId = this.generateSessionId();
  }

  static getInstance(): BehaviorTracker {
    if (!BehaviorTracker.instance) {
      BehaviorTracker.instance = new BehaviorTracker();
    }
    return BehaviorTracker.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  startTracking(userId: string) {
    if (this.isTracking) return;
    
    this.isTracking = true;
    this.sessionId = this.generateSessionId();
    
    // Отслеживаем клики
    document.addEventListener('click', (e) => this.trackClick(e, userId));
    
    // Отслеживаем скроллинг
    let scrollTimer: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => this.trackScroll(userId), 100);
    });
    
    // Отслеживаем фокус/блюр окна
    window.addEventListener('focus', () => this.trackFocus(userId, true));
    window.addEventListener('blur', () => this.trackFocus(userId, false));
    
    // Отслеживаем навигацию
    window.addEventListener('popstate', () => this.trackNavigation(userId));
    
    this.logger.info('Трекинг поведения запущен', { userId, sessionId: this.sessionId });
  }

  stopTracking() {
    this.isTracking = false;
    this.flushEvents();
    this.logger.info('Трекинг поведения остановлен');
  }

  private trackClick(event: MouseEvent, userId: string) {
    if (!this.isTracking) return;

    const target = event.target as HTMLElement;
    const metrics: BehaviorMetrics = {
      user_id: userId,
      session_id: this.sessionId,
      page_path: window.location.pathname,
      action_type: 'click',
      element_id: target.id || target.className || target.tagName,
      timestamp: new Date().toISOString(),
      duration_ms: 0,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight
    };

    this.eventQueue.push(metrics);
    this.flushEventsIfNeeded();
  }

  private trackScroll(userId: string) {
    if (!this.isTracking) return;

    const metrics: BehaviorMetrics = {
      user_id: userId,
      session_id: this.sessionId,
      page_path: window.location.pathname,
      action_type: 'scroll',
      timestamp: new Date().toISOString(),
      duration_ms: 0,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight
    };

    this.eventQueue.push(metrics);
    this.flushEventsIfNeeded();
  }

  private trackFocus(userId: string, hasFocus: boolean) {
    if (!this.isTracking) return;

    const metrics: BehaviorMetrics = {
      user_id: userId,
      session_id: this.sessionId,
      page_path: window.location.pathname,
      action_type: hasFocus ? 'focus' : 'blur',
      timestamp: new Date().toISOString(),
      duration_ms: 0,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight
    };

    this.eventQueue.push(metrics);
    this.flushEventsIfNeeded();
  }

  private trackNavigation(userId: string) {
    if (!this.isTracking) return;

    const metrics: BehaviorMetrics = {
      user_id: userId,
      session_id: this.sessionId,
      page_path: window.location.pathname,
      action_type: 'navigation',
      timestamp: new Date().toISOString(),
      duration_ms: 0,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight
    };

    this.eventQueue.push(metrics);
    this.flushEventsIfNeeded();
  }

  private flushEventsIfNeeded() {
    if (this.eventQueue.length >= 10) {
      this.flushEvents();
    }
  }

  private flushEvents() {
    if (this.eventQueue.length === 0) return;

    try {
      const existingData = localStorage.getItem('behavior_metrics') || '[]';
      const metricsArray = JSON.parse(existingData);
      metricsArray.push(...this.eventQueue);
      
      // Храним только последние 5000 событий
      if (metricsArray.length > 5000) {
        metricsArray.splice(0, metricsArray.length - 5000);
      }
      
      localStorage.setItem('behavior_metrics', JSON.stringify(metricsArray));
      this.eventQueue = [];
      
      this.logger.debug('События поведения сохранены', { count: this.eventQueue.length });
    } catch (error) {
      this.logger.error('Ошибка сохранения событий поведения', { error });
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
