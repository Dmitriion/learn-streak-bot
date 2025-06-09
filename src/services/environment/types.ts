
export type EnvironmentMode = 'development' | 'production' | 'test';

export interface EnvironmentStrategy {
  getMode(): EnvironmentMode;
  shouldUseMockData(): boolean;
  shouldEnableFallbacks(): boolean;
  getLogLevel(): 'debug' | 'info' | 'warn' | 'error';
  validateConfiguration(): ConfigValidationResult;
}

export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FallbackConfig {
  maxRetries: number;
  timeout: number;
  circuitBreakerThreshold: number;
  fallbackEnabled: boolean;
}

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: string;
  errorCount: number;
  responseTime?: number;
}
