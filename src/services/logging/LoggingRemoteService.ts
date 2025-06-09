
import { LogEntry } from '../LoggingService';

export interface LogBatch {
  logs: LogEntry[];
  timestamp: string;
  sessionId: string;
  userId?: string;
  environment: string;
  appVersion: string;
}

export interface LoggingConfig {
  batchSize: number;
  flushInterval: number;
  maxRetries: number;
  enableCompression: boolean;
  productionLevels: ('error' | 'warn' | 'info' | 'debug')[];
}

interface N8NIntegrationLike {
  sendEvent(event: any): Promise<boolean>;
}

class LoggingRemoteService {
  private static instance: LoggingRemoteService;
  private config: LoggingConfig;
  private pendingLogs: LogEntry[] = [];
  private lastFlushTime: number = 0;
  private isOnline: boolean = navigator.onLine;
  private n8nIntegration: N8NIntegrationLike | null = null;

  constructor() {
    this.config = this.getDefaultConfig();
    this.setupNetworkListeners();
  }

  static getInstance(): LoggingRemoteService {
    if (!LoggingRemoteService.instance) {
      LoggingRemoteService.instance = new LoggingRemoteService();
    }
    return LoggingRemoteService.instance;
  }

  // Метод для отложенной инициализации N8N интеграции
  setN8NIntegration(n8nIntegration: N8NIntegrationLike) {
    this.n8nIntegration = n8nIntegration;
    console.info('[LoggingRemoteService] N8N интеграция подключена');
  }

  private getDefaultConfig(): LoggingConfig {
    return {
      batchSize: 50,
      flushInterval: 5 * 60 * 1000, // 5 минут
      maxRetries: 3,
      enableCompression: true,
      productionLevels: import.meta.env.PROD ? ['error', 'warn'] : ['error', 'warn', 'info', 'debug']
    };
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.attemptFlush();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  updateConfig(newConfig: Partial<LoggingConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  async sendLogs(logs: LogEntry[]): Promise<boolean> {
    if (!this.isOnline || logs.length === 0) {
      return false;
    }

    // Фильтруем логи по уровню для production
    const filteredLogs = logs.filter(log => 
      this.config.productionLevels.includes(log.level)
    );

    if (filteredLogs.length === 0) {
      return true; // Нет логов для отправки в этом режиме
    }

    const batch: LogBatch = {
      logs: filteredLogs,
      timestamp: new Date().toISOString(),
      sessionId: filteredLogs[0]?.sessionId || 'unknown',
      userId: filteredLogs[0]?.userId,
      environment: import.meta.env.MODE,
      appVersion: '1.0.0'
    };

    try {
      // Если N8N интеграция доступна, используем её
      if (this.n8nIntegration) {
        const success = await this.n8nIntegration.sendEvent({
          type: 'logs_batch',
          user_id: batch.userId || 'anonymous',
          timestamp: batch.timestamp,
          data: {
            batch,
            logCount: filteredLogs.length,
            environment: batch.environment
          }
        });

        if (success) {
          console.info(`[LoggingRemoteService] Отправлено ${filteredLogs.length} логов через N8N`);
        }

        return success;
      } else {
        // Fallback: сохраняем в localStorage для последующей отправки
        const storedLogs = JSON.parse(localStorage.getItem('pending_logs') || '[]');
        storedLogs.push(...filteredLogs);
        localStorage.setItem('pending_logs', JSON.stringify(storedLogs.slice(-200))); // Ограничиваем размер
        
        console.info(`[LoggingRemoteService] Логи сохранены локально (N8N недоступен): ${filteredLogs.length}`);
        return true;
      }
    } catch (error) {
      console.error('[LoggingRemoteService] Ошибка отправки логов:', error);
      return false;
    }
  }

  async flushPendingLogs(logs: LogEntry[]): Promise<void> {
    if (logs.length === 0) return;

    this.pendingLogs.push(...logs);

    // Немедленная отправка при критических ошибках
    const hasErrors = logs.some(log => log.level === 'error');
    const shouldFlushNow = hasErrors || 
                          this.pendingLogs.length >= this.config.batchSize ||
                          (Date.now() - this.lastFlushTime) >= this.config.flushInterval;

    if (shouldFlushNow) {
      await this.attemptFlush();
    }
  }

  private async attemptFlush(): Promise<void> {
    if (this.pendingLogs.length === 0) return;

    const logsToSend = [...this.pendingLogs];
    this.pendingLogs = [];

    const success = await this.withRetry(
      () => this.sendLogs(logsToSend),
      this.config.maxRetries,
      1000
    );

    if (!success) {
      // Возвращаем логи обратно в очередь при неудаче
      this.pendingLogs.unshift(...logsToSend);
      console.warn('[LoggingRemoteService] Не удалось отправить логи, сохранены в очереди');
    } else {
      this.lastFlushTime = Date.now();
    }
  }

  // Внутренний retry механизм без зависимости от ErrorService
  private async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          console.error(`[LoggingRemoteService] Операция завершилась неудачей после ${maxRetries} попыток:`, lastError);
          throw lastError;
        }

        // Экспоненциальная задержка
        const retryDelay = delay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }

    throw lastError!;
  }

  async forceFlush(): Promise<void> {
    await this.attemptFlush();
  }

  getPendingLogsCount(): number {
    return this.pendingLogs.length;
  }

  getConfig(): LoggingConfig {
    return { ...this.config };
  }

  // Метод для отправки сохраненных локально логов когда N8N станет доступен
  async flushStoredLogs(): Promise<void> {
    if (!this.n8nIntegration) return;

    try {
      const storedLogs = JSON.parse(localStorage.getItem('pending_logs') || '[]');
      if (storedLogs.length > 0) {
        const success = await this.sendLogs(storedLogs);
        if (success) {
          localStorage.removeItem('pending_logs');
          console.info(`[LoggingRemoteService] Отправлены сохраненные логи: ${storedLogs.length}`);
        }
      }
    } catch (error) {
      console.error('[LoggingRemoteService] Ошибка отправки сохраненных логов:', error);
    }
  }
}

export default LoggingRemoteService;
