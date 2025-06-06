
import LoggingService from './LoggingService';

export type ErrorCategory = 'network' | 'validation' | 'payment' | 'auth' | 'ui' | 'telegram' | 'unknown';

export interface AppError {
  id: string;
  category: ErrorCategory;
  message: string;
  originalError?: Error;
  context?: any;
  timestamp: string;
  userId?: string;
  recoverable: boolean;
}

class ErrorService {
  private static instance: ErrorService;
  private logger: LoggingService;
  private errorCallbacks: ((error: AppError) => void)[] = [];

  constructor() {
    this.logger = LoggingService.getInstance();
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  private setupGlobalErrorHandlers() {
    // Глобальный обработчик ошибок JavaScript
    window.addEventListener('error', (event) => {
      this.handleError({
        category: 'unknown',
        message: event.message,
        originalError: event.error,
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
        recoverable: false,
      });
    });

    // Глобальный обработчик необработанных промисов
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        category: 'unknown',
        message: 'Unhandled Promise Rejection',
        originalError: event.reason,
        recoverable: false,
      });
    });
  }

  handleError(errorData: Omit<AppError, 'id' | 'timestamp' | 'userId'>): AppError {
    const error: AppError = {
      ...errorData,
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      userId: this.logger.getLogs()[0]?.userId,
    };

    // Логируем ошибку
    this.logger.error(`[${error.category}] ${error.message}`, {
      errorId: error.id,
      context: error.context,
      originalError: error.originalError,
    });

    // Уведомляем подписчиков
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (callbackError) {
        console.error('Ошибка в callback обработчике:', callbackError);
      }
    });

    return error;
  }

  private generateErrorId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Специализированные методы для разных типов ошибок
  handleNetworkError(originalError: Error, context?: any): AppError {
    return this.handleError({
      category: 'network',
      message: 'Ошибка сети',
      originalError,
      context,
      recoverable: true,
    });
  }

  handlePaymentError(message: string, context?: any): AppError {
    return this.handleError({
      category: 'payment',
      message,
      context,
      recoverable: true,
    });
  }

  handleTelegramError(message: string, context?: any): AppError {
    return this.handleError({
      category: 'telegram',
      message,
      context,
      recoverable: false,
    });
  }

  handleValidationError(message: string, context?: any): AppError {
    return this.handleError({
      category: 'validation',
      message,
      context,
      recoverable: true,
    });
  }

  onError(callback: (error: AppError) => void) {
    this.errorCallbacks.push(callback);
    
    // Возвращаем функцию для отписки
    return () => {
      const index = this.errorCallbacks.indexOf(callback);
      if (index > -1) {
        this.errorCallbacks.splice(index, 1);
      }
    };
  }

  // Метод для retry логики
  async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    category: ErrorCategory = 'network'
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          this.handleError({
            category,
            message: `Операция завершилась неудачей после ${maxRetries} попыток`,
            originalError: lastError,
            context: { attempts: maxRetries },
            recoverable: false,
          });
          throw lastError;
        }

        // Экспоненциальная задержка
        const retryDelay = delay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }

    throw lastError!;
  }
}

export default ErrorService;
