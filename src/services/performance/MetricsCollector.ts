
import LoggingService from '../LoggingService';
import { MetricsData, PerformanceMetrics } from '../../types/metrics';

export class MetricsCollector {
  private static instance: MetricsCollector;
  private logger: LoggingService;
  private metrics: MetricsData | null = null;
  private startTime: number = Date.now();
  private customMetrics: { [key: string]: number } = {};

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

  // Новые методы для совместимости с PerformanceService
  recordMetric(name: string, value: number) {
    this.customMetrics[name] = value;
  }

  startTiming(label: string): () => void {
    const startTime = Date.now();
    return () => {
      const duration = Date.now() - startTime;
      this.recordMetric(label, duration);
    };
  }

  measureComponentRender(componentName: string, renderFunction: () => void) {
    const endTiming = this.startTiming(`component_render_${componentName}`);
    renderFunction();
    endTiming();
  }

  async measureAPICall<T>(label: string, apiCall: () => Promise<T>): Promise<T> {
    const endTiming = this.startTiming(`api_call_${label}`);
    try {
      const result = await apiCall();
      endTiming();
      return result;
    } catch (error) {
      endTiming();
      throw error;
    }
  }

  getMetrics(): { [key: string]: number } {
    return { ...this.customMetrics };
  }

  flushMetrics() {
    this.customMetrics = {};
  }

  clearMetrics() {
    this.customMetrics = {};
    this.logger.info('Кастомные метрики очищены');
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      return memoryInfo?.usedJSHeapSize || 0;
    }
    return 0;
  }

  private getBundleSize(): number {
    if ('getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return resources
        .filter(resource => resource.name.includes('.js'))
        .reduce((total, resource) => total + (resource.transferSize || 0), 0);
    }
    return 0;
  }

  exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2);
  }
}

export default MetricsCollector;
