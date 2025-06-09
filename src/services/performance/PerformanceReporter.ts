
import LoggingService from '../LoggingService';
import { PerformanceMetric, PerformanceReport, WebVitalsMetrics } from './types';

export class PerformanceReporter {
  private logger: LoggingService;

  constructor() {
    this.logger = LoggingService.getInstance();
  }

  async sendMetrics(metrics: PerformanceMetric[]) {
    try {
      // В production только логируем метрики локально
      if (import.meta.env.PROD) {
        this.logger.info('Performance metrics collected', { 
          metricsCount: metrics.length,
          timestamp: Date.now()
        });
      } else {
        // В development можем логировать детали
        this.logger.debug('Performance metrics details', { metrics });
      }
    } catch (error) {
      this.logger.error('Ошибка обработки метрик производительности', { error });
    }
  }

  generatePerformanceReport(metrics: WebVitalsMetrics & { [key: string]: number }): PerformanceReport {
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
}
