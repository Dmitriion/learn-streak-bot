
import LoggingService from '../LoggingService';
import { PerformanceReporter } from './PerformanceReporter';
import { WebVitalsMetrics, MetricThresholds } from './types';

export class MetricsCollector {
  private logger: LoggingService;
  private reporter: PerformanceReporter;
  private metrics: Map<string, number> = new Map();

  private readonly THRESHOLDS: MetricThresholds = {
    'LCP': 2500,  // Более 2.5 секунд - плохо
    'FID': 100,   // Более 100мс - плохо
    'CLS': 0.1,   // Более 0.1 - плохо
    'TTFB': 800,  // Более 800мс - плохо
    'pageLoadTime': 3000 // Более 3 секунд - плохо
  };

  constructor() {
    this.logger = LoggingService.getInstance();
    this.reporter = new PerformanceReporter();
  }

  recordMetric(name: string, value: number) {
    this.metrics.set(name, value);
    this.logger.debug(`Performance metric recorded: ${name}`, { value });

    // Отправляем критические метрики сразу
    if (this.isCriticalMetric(name, value)) {
      this.reporter.sendMetrics([{ name, value, timestamp: Date.now() }]);
    }
  }

  private isCriticalMetric(name: string, value: number): boolean {
    const threshold = this.THRESHOLDS[name];
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

  measureComponentRender(componentName: string, renderFunction: () => void) {
    const startTime = performance.now();
    renderFunction();
    const endTime = performance.now();
    
    this.recordMetric(`${componentName}_render_time`, endTime - startTime);
  }

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

  flushMetrics() {
    const allMetrics = Array.from(this.metrics.entries()).map(([name, value]) => ({
      name,
      value,
      timestamp: Date.now()
    }));

    if (allMetrics.length > 0) {
      this.reporter.sendMetrics(allMetrics);
      this.logger.info('Метрики производительности отправлены', { count: allMetrics.length });
    }
  }

  clearMetrics() {
    this.metrics.clear();
  }
}
