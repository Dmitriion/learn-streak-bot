
import LoggingService from '../LoggingService';
import { MetricsData, PerformanceMetrics } from '../../types/metrics';

class MetricsCollector {
  private static instance: MetricsCollector;
  private logger: LoggingService;
  private metrics: MetricsData | null = null;
  private startTime: number = Date.now();

  constructor() {
    this.logger = LoggingService.getInstance();
  }

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  initializeMetrics(userId: string, sessionId: string) {
    const performanceMetrics: PerformanceMetrics = {
      loadTime: Date.now() - this.startTime,
      renderTime: 0,
      interactionTime: 0,
      memoryUsage: this.getMemoryUsage(),
      bundleSize: this.getBundleSize(),
      errorCount: 0
    };

    this.metrics = {
      timestamp: new Date().toISOString(),
      userId,
      sessionId,
      performance: performanceMetrics,
      errors: []
    };

    this.logger.info('Метрики инициализированы', { userId, sessionId });
  }

  recordRenderTime(duration: number) {
    if (this.metrics) {
      this.metrics.performance.renderTime = duration;
    }
  }

  recordInteractionTime(duration: number) {
    if (this.metrics) {
      this.metrics.performance.interactionTime = duration;
    }
  }

  recordError(error: Error | string) {
    if (!this.metrics) return;

    const errorRecord = {
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    };

    this.metrics.errors.push(errorRecord);
    this.metrics.performance.errorCount++;
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      return memoryInfo?.usedJSHeapSize || 0;
    }
    return 0;
  }

  private getBundleSize(): number {
    // Примерная оценка размера bundle
    if ('getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return resources
        .filter(resource => resource.name.includes('.js'))
        .reduce((total, resource) => total + (resource.transferSize || 0), 0);
    }
    return 0;
  }

  getMetrics(): MetricsData | null {
    return this.metrics ? { ...this.metrics } : null;
  }

  exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2);
  }

  clearMetrics() {
    this.metrics = null;
    this.logger.info('Метрики очищены');
  }
}

export default MetricsCollector;
