
import { WebVitalsObserver } from './performance/WebVitalsObserver';
import { MetricsCollector } from './performance/MetricsCollector';
import { PerformanceReporter } from './performance/PerformanceReporter';
import { WebVitalsMetrics, CustomMetrics, PerformanceReport } from './performance/types';

class PerformanceService {
  private static instance: PerformanceService;
  private webVitalsObserver: WebVitalsObserver;
  private metricsCollector: MetricsCollector;
  private performanceReporter: PerformanceReporter;

  constructor() {
    this.metricsCollector = new MetricsCollector();
    this.performanceReporter = new PerformanceReporter();
    this.webVitalsObserver = new WebVitalsObserver(this.metricsCollector);
  }

  static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  recordMetric(name: string, value: number) {
    this.metricsCollector.recordMetric(name, value);
  }

  startTiming(label: string): () => void {
    return this.metricsCollector.startTiming(label);
  }

  measureComponentRender(componentName: string, renderFunction: () => void) {
    this.metricsCollector.measureComponentRender(componentName, renderFunction);
  }

  async measureAPICall<T>(label: string, apiCall: () => Promise<T>): Promise<T> {
    return this.metricsCollector.measureAPICall(label, apiCall);
  }

  getMetrics(): WebVitalsMetrics & { [key: string]: number } {
    return this.metricsCollector.getMetrics();
  }

  flushMetrics() {
    this.metricsCollector.flushMetrics();
  }

  getPerformanceReport(): PerformanceReport {
    const metrics = this.metricsCollector.getMetrics();
    return this.performanceReporter.generatePerformanceReport(metrics);
  }

  destroy() {
    this.webVitalsObserver.destroy();
    this.metricsCollector.clearMetrics();
  }
}

export default PerformanceService;
export type { WebVitalsMetrics, CustomMetrics } from './performance/types';
