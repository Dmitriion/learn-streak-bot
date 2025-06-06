
import LoggingService from '../LoggingService';
import ErrorService from '../ErrorService';
import { MetricsCollector } from './MetricsCollector';

export class WebVitalsObserver {
  private logger: LoggingService;
  private errorService: ErrorService;
  private metricsCollector: MetricsCollector;
  private observers: PerformanceObserver[] = [];

  constructor(metricsCollector: MetricsCollector) {
    this.logger = LoggingService.getInstance();
    this.errorService = ErrorService.getInstance();
    this.metricsCollector = metricsCollector;
    this.initializeObservers();
  }

  private initializeObservers() {
    try {
      if ('PerformanceObserver' in window) {
        this.setupLCPObserver();
        this.setupFIDObserver();
        this.setupCLSObserver();
        this.setupNavigationObserver();
        this.setupPaintObserver();
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

  private setupLCPObserver() {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      this.metricsCollector.recordMetric('LCP', lastEntry.startTime);
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.push(lcpObserver);
  }

  private setupFIDObserver() {
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        this.metricsCollector.recordMetric('FID', entry.processingStart - entry.startTime);
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });
    this.observers.push(fidObserver);
  }

  private setupCLSObserver() {
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.metricsCollector.recordMetric('CLS', clsValue);
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
    this.observers.push(clsObserver);
  }

  private setupNavigationObserver() {
    const navigationObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        this.metricsCollector.recordMetric('TTFB', entry.responseStart - entry.requestStart);
        if (entry.type === 'navigation') {
          this.metricsCollector.recordMetric('pageLoadTime', entry.loadEventEnd - entry.navigationStart);
        }
      });
    });
    navigationObserver.observe({ entryTypes: ['navigation'] });
    this.observers.push(navigationObserver);
  }

  private setupPaintObserver() {
    const paintObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (entry.name === 'first-contentful-paint') {
          this.metricsCollector.recordMetric('FCP', entry.startTime);
        }
      });
    });
    paintObserver.observe({ entryTypes: ['paint'] });
    this.observers.push(paintObserver);
  }

  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}
