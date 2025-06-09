
import CircuitBreaker from './CircuitBreaker';
import LoggingService from '../LoggingService';
import EnvironmentManager from '../environment/EnvironmentManager';
import { FallbackConfig } from '../environment/types';

type FallbackStrategy = 'immediate' | 'retry' | 'circuit-breaker' | 'graceful-degradation';

interface FallbackOptions {
  strategy: FallbackStrategy;
  config: Partial<FallbackConfig>;
  fallbackValue?: any;
  fallbackFunction?: () => Promise<any>;
}

class FallbackManager {
  private static instance: FallbackManager;
  private circuitBreakers = new Map<string, CircuitBreaker>();
  private logger: LoggingService;
  private environmentManager: EnvironmentManager;

  constructor() {
    this.logger = LoggingService.getInstance();
    this.environmentManager = EnvironmentManager.getInstance();
  }

  static getInstance(): FallbackManager {
    if (!FallbackManager.instance) {
      FallbackManager.instance = new FallbackManager();
    }
    return FallbackManager.instance;
  }

  async executeWithFallback<T>(
    serviceName: string,
    primaryOperation: () => Promise<T>,
    options: FallbackOptions
  ): Promise<T> {
    if (!this.environmentManager.shouldEnableFallbacks()) {
      return await primaryOperation();
    }

    const config: FallbackConfig = {
      maxRetries: 3,
      timeout: 5000,
      circuitBreakerThreshold: 5,
      fallbackEnabled: true,
      ...options.config
    };

    this.logger.debug(`FallbackManager: выполнение ${serviceName} со стратегией ${options.strategy}`);

    try {
      switch (options.strategy) {
        case 'immediate':
          return await this.executeImmediate(primaryOperation);
        
        case 'retry':
          return await this.executeWithRetry(primaryOperation, config);
        
        case 'circuit-breaker':
          return await this.executeWithCircuitBreaker(serviceName, primaryOperation, config);
        
        case 'graceful-degradation':
          return await this.executeWithGracefulDegradation(
            primaryOperation, 
            options.fallbackFunction || (() => Promise.resolve(options.fallbackValue))
          );
        
        default:
          return await primaryOperation();
      }
    } catch (error) {
      this.logger.error(`FallbackManager: все стратегии провалились для ${serviceName}`, { error });
      
      if (options.fallbackValue !== undefined) {
        this.logger.info(`FallbackManager: используем fallback значение для ${serviceName}`);
        return options.fallbackValue;
      }
      
      if (options.fallbackFunction) {
        this.logger.info(`FallbackManager: используем fallback функцию для ${serviceName}`);
        return await options.fallbackFunction();
      }
      
      throw error;
    }
  }

  private async executeImmediate<T>(operation: () => Promise<T>): Promise<T> {
    return await operation();
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>, 
    config: FallbackConfig
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < config.maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff
          this.logger.debug(`Retry attempt ${attempt} failed, waiting ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  private async executeWithCircuitBreaker<T>(
    serviceName: string,
    operation: () => Promise<T>,
    config: FallbackConfig
  ): Promise<T> {
    let circuitBreaker = this.circuitBreakers.get(serviceName);
    
    if (!circuitBreaker) {
      circuitBreaker = new CircuitBreaker(serviceName, {
        threshold: config.circuitBreakerThreshold,
        timeout: config.timeout,
        resetTimeout: 30000 // 30 секунд
      });
      this.circuitBreakers.set(serviceName, circuitBreaker);
    }

    return await circuitBreaker.execute(operation);
  }

  private async executeWithGracefulDegradation<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>
  ): Promise<T> {
    try {
      return await primaryOperation();
    } catch (error) {
      this.logger.warn('Primary operation failed, using fallback');
      return await fallbackOperation();
    }
  }

  getCircuitBreakerStatus(serviceName: string) {
    const circuitBreaker = this.circuitBreakers.get(serviceName);
    return circuitBreaker ? {
      state: circuitBreaker.getState(),
      failures: circuitBreaker.getFailures()
    } : null;
  }

  resetCircuitBreaker(serviceName: string) {
    const circuitBreaker = this.circuitBreakers.get(serviceName);
    if (circuitBreaker) {
      circuitBreaker.reset();
      this.logger.info(`Circuit breaker reset for ${serviceName}`);
    }
  }
}

export default FallbackManager;
