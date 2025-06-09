
import LoggingService from '../LoggingService';

type CircuitState = 'closed' | 'open' | 'half-open';

interface CircuitBreakerConfig {
  threshold: number;
  timeout: number;
  resetTimeout: number;
}

class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failures = 0;
  private lastFailureTime = 0;
  private logger: LoggingService;

  constructor(
    private name: string,
    private config: CircuitBreakerConfig
  ) {
    this.logger = LoggingService.getInstance();
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.config.resetTimeout) {
        this.state = 'half-open';
        this.logger.info(`CircuitBreaker ${this.name}: переход в half-open`);
      } else {
        throw new Error(`CircuitBreaker ${this.name} открыт`);
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    if (this.state === 'half-open') {
      this.state = 'closed';
      this.logger.info(`CircuitBreaker ${this.name}: восстановлен (closed)`);
    }
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.config.threshold) {
      this.state = 'open';
      this.logger.warn(`CircuitBreaker ${this.name}: открыт после ${this.failures} ошибок`);
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  getFailures(): number {
    return this.failures;
  }

  reset() {
    this.state = 'closed';
    this.failures = 0;
    this.lastFailureTime = 0;
    this.logger.info(`CircuitBreaker ${this.name}: сброшен`);
  }
}

export default CircuitBreaker;
