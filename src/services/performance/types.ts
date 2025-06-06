
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

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

export interface PerformanceReport {
  overall: 'good' | 'needs-improvement' | 'poor';
  details: WebVitalsMetrics & { [key: string]: number };
  recommendations: string[];
}

export interface MetricThresholds {
  [key: string]: number;
}
