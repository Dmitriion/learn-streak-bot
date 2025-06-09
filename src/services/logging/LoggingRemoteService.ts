
import LoggingService, { LogEntry } from '../LoggingService';
import N8NIntegration from '../automation/N8NIntegration';
import ErrorService from '../ErrorService';

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

class LoggingRemoteService {
  private static instance: LoggingRemoteService;
  private n8nIntegration: N8NIntegration;
  private errorService: ErrorService;
  private config: LoggingConfig;
  private pendingLogs: LogEntry[] = [];
  private lastFlushTime: number = 0;
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.n8nIntegration = N8NIntegration.getInstance();
    this.errorService = ErrorService.getInstance();
    this.config = this.getDefaultConfig();
    this.setupNetworkListeners();
  }

  static getInstance(): LoggingRemoteService {
    if (!LoggingRemoteService.instance) {
      LoggingRemoteService.instance = new LoggingRemoteService();
    }
    return LoggingRemoteService.instance;
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
        console.info(`[LoggingRemoteService] Отправлено ${filteredLogs.length} логов`);
      }

      return success;
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

    const success = await this.errorService.withRetry(
      () => this.sendLogs(logsToSend),
      this.config.maxRetries,
      1000,
      'network'
    );

    if (!success) {
      // Возвращаем логи обратно в очередь при неудаче
      this.pendingLogs.unshift(...logsToSend);
      console.warn('[LoggingRemoteService] Не удалось отправить логи, сохранены в очереди');
    } else {
      this.lastFlushTime = Date.now();
    }
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
}

export default LoggingRemoteService;
