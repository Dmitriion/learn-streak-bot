
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage: number;
  bundleSize: number;
  errorCount: number;
}

export interface AutomationHealthDetails {
  webhookUrl: string;
  lastSuccessfulCall: string | null;
  lastError: string | null;
  responseTime: number;
  status: 'healthy' | 'degraded' | 'unhealthy';
  retryCount: number;
}

export interface MetricsData {
  timestamp: string;
  userId: string;
  sessionId: string;
  performance: PerformanceMetrics;
  automation?: AutomationHealthDetails;
  errors: Array<{
    message: string;
    stack?: string;
    timestamp: string;
  }>;
}

export interface CloudStorageData {
  [key: string]: string | number | boolean | null | undefined;
}
