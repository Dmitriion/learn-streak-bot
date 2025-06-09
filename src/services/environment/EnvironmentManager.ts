
import { EnvironmentStrategy, EnvironmentMode } from './types';
import { DevelopmentStrategy, ProductionStrategy } from './EnvironmentStrategy';
import LoggingService from '../LoggingService';

class EnvironmentManager {
  private static instance: EnvironmentManager;
  private strategy: EnvironmentStrategy;
  private logger: LoggingService;

  constructor() {
    this.logger = LoggingService.getInstance();
    this.strategy = this.createStrategy();
    this.validateEnvironment();
  }

  static getInstance(): EnvironmentManager {
    if (!EnvironmentManager.instance) {
      EnvironmentManager.instance = new EnvironmentManager();
    }
    return EnvironmentManager.instance;
  }

  private createStrategy(): EnvironmentStrategy {
    const mode = import.meta.env.PROD ? 'production' : 'development';
    
    switch (mode) {
      case 'production':
        return new ProductionStrategy();
      case 'development':
      default:
        return new DevelopmentStrategy();
    }
  }

  private validateEnvironment() {
    const result = this.strategy.validateConfiguration();
    
    if (result.errors.length > 0) {
      this.logger.error('Environment validation failed', { errors: result.errors });
    }
    
    if (result.warnings.length > 0) {
      this.logger.warn('Environment warnings', { warnings: result.warnings });
    }
  }

  getStrategy(): EnvironmentStrategy {
    return this.strategy;
  }

  getMode(): EnvironmentMode {
    return this.strategy.getMode();
  }

  shouldUseMockData(): boolean {
    return this.strategy.shouldUseMockData();
  }

  shouldEnableFallbacks(): boolean {
    return this.strategy.shouldEnableFallbacks();
  }

  isProduction(): boolean {
    return this.getMode() === 'production';
  }

  isDevelopment(): boolean {
    return this.getMode() === 'development';
  }
}

export default EnvironmentManager;
