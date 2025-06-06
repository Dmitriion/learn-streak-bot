
import LoggingService from './LoggingService';
import ErrorService from './ErrorService';

export interface WebVitalsMetrics {
  FCP?: number;  // First Contentful Paint
  LCP?: number;  // Largest Contentful Paint
  FID?: number;  // First Input Delay
  CLS?: number;  // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
}

export interface CustomMetrics {
  pageLoadTime: number;
  componentRenderTime: number;
  apiResponseTime: number;
  userInteractionDelay: number;
}

class PerformanceService {
  private static instance: PerformanceService;
  private logger: LoggingService;
  private errorService: ErrorService;
  private metrics: Map<string, number> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.logger = LoggingService.getInstance();
    this.errorService = ErrorService.getInstance();
    this.initializePerformanceObservers();
  }

  static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  private initializePerformanceObservers() {
    try {
      // Web Vitals observers
      if ('PerformanceObserver' in window) {
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.recordMetric('LCP', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.recordMetric('FID', entry.processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);

        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.recordMetric('CLS', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);

        // Navigation timing для TTFB и FCP
        const navigationObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.recordMetric('TTFB', entry.responseStart - entry.requestStart);
            if (entry.type === 'navigation') {
              this.recordMetric('pageLoadTime', entry.loadEventEnd - entry.navigationStart);
            }
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navigationObserver);

        // Paint timing для FCP
        const paintObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.name === 'first-contentful-paint') {
              this.recordMetric('FCP', entry.startTime);
            }
          });
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);
      }
    } catch (error) {
      this.errorService.handleError({
        category: 'ui',
        message: 'Ошибка инициализации Performance Observers',
        originalError: error as Error,
        recoverable: true
      });
    }
  }

  recordMetric(name: string, value: number) {
    this.metrics.set(name, value);
    this.logger.debug(`Performance metric recorded: ${name}`, { value });

    // Отправляем критические метрики сразу
    if (this.isCriticalMetric(name, value)) {
      this.sendMetrics([{ name, value, timestamp: Date.now() }]);
    }
  }

  private isCriticalMetric(name: string, value: number): boolean {
    const thresholds = {
      'LCP': 2500,  // Более 2.5 секунд - плохо
      'FID': 100,   // Более 100мс - плохо
      'CLS': 0.1,   // Более 0.1 - плохо
      'TTFB': 800,  // Более 800мс - плохо
      'pageLoadTime': 3000 // Более 3 секунд - плохо
    };

    const threshold = thresholds[name as keyof typeof thresholds];
    return threshold !== undefined && value > threshold;
  }

  startTiming(label: string): () => void {
    const startTime = performance.now();
    this.logger.debug(`Timing started: ${label}`);

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.recordMetric(label, duration);
      this.logger.debug(`Timing ended: ${label}`, { duration });
    };
  }

  // Для измерения времени рендера компонентов
  measureComponentRender(componentName: string, renderFunction: () => void) {
    const startTime = performance.now();
    renderFunction();
    const endTime = performance.now();
    
    this.recordMetric(`${componentName}_render_time`, endTime - startTime);
  }

  // Для измерения API запросов
  async measureAPICall<T>(label: string, apiCall: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const endTime = performance.now();
      this.recordMetric(`api_${label}`, endTime - startTime);
      return result;
    } catch (error) {
      const endTime = performance.now();
      this.recordMetric(`api_${label}_error`, endTime - startTime);
      throw error;
    }
  }

  getMetrics(): WebVitalsMetrics & { [key: string]: number } {
    const metricsObj: any = {};
    this.metrics.forEach((value, key) => {
      metricsObj[key] = value;
    });
    return metricsObj;
  }

  // Отправка метрик на сервер (через N8N webhook)
  private async sendMetrics(metrics: Array<{ name: string; value: number; timestamp: number }>) {
    try {
      if (process.env.NODE_ENV === 'production') {
        // В production отправляем на реальный endpoint
        await fetch('/api/metrics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            metrics,
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: Date.now()
          }),
        });
      }
    } catch (error) {
      this.logger.error('Ошибка отправки метрик производительности', { error });
    }
  }

  // Еженедельная отправка всех метрик
  flushMetrics() {
    const allMetrics = Array.from(this.metrics.entries()).map(([name, value]) => ({
      name,
      value,
      timestamp: Date.now()
    }));

    if (allMetrics.length > 0) {
      this.sendMetrics(allMetrics);
      this.logger.info('Метрики производительности отправлены', { count: allMetrics.length });
    }
  }

  // Получение отчета о производительности
  getPerformanceReport(): {
    overall: 'good' | 'needs-improvement' | 'poor';
    details: WebVitalsMetrics & { [key: string]: number };
    recommendations: string[];
  } {
    const metrics = this.getMetrics();
    let score = 0;
    const recommendations: string[] = [];

    // Оценка LCP
    if (metrics.LCP) {
      if (metrics.LCP <= 2500) score += 1;
      else if (metrics.LCP <= 4000) score += 0.5;
      else recommendations.push('Улучшите время загрузки контента (LCP)');
    }

    // Оценка FID
    if (metrics.FID) {
      if (metrics.FID <= 100) score += 1;
      else if (metrics.FID <= 300) score += 0.5;
      else recommendations.push('Оптимизируйте интерактивность (FID)');
    }

    // Оценка CLS
    if (metrics.CLS) {
      if (metrics.CLS <= 0.1) score += 1;
      else if (metrics.CLS <= 0.25) score += 0.5;
      else recommendations.push('Уменьшите смещение контента (CLS)');
    }

    const maxScore = 3;
    const normalizedScore = score / maxScore;

    let overall: 'good' | 'needs-improvement' | 'poor';
    if (normalizedScore >= 0.8) overall = 'good';
    else if (normalizedScore >= 0.5) overall = 'needs-improvement';
    else overall = 'poor';

    return {
      overall,
      details: metrics,
      recommendations
    };
  }

  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

export default PerformanceService;
