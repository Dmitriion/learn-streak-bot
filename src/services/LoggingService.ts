
import LoggingRemoteService from './logging/LoggingRemoteService';
import LoggingStorageService from './logging/LoggingStorageService';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  route?: string;
}

class LoggingService {
  private static instance: LoggingService;
  private logs: LogEntry[] = [];
  private sessionId: string;
  private userId?: string;
  private maxLocalLogs = 100;
  private remoteService: LoggingRemoteService;
  private storageService: LoggingStorageService;
  private flushTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.remoteService = LoggingRemoteService.getInstance();
    this.storageService = LoggingStorageService.getInstance();
    this.initializeService();
  }

  static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  private async initializeService() {
    if (this.isInitialized) return;

    try {
      await this.storageService.initialize();
      this.setupPeriodicFlush();
      this.setupBeforeUnloadHandler();
      this.syncStoredLogs();
      this.isInitialized = true;
    } catch (error) {
      console.error('[LoggingService] Ошибка инициализации:', error);
    }
  }

  private setupPeriodicFlush() {
    // Автоматическая отправка каждые 5 минут
    this.flushTimer = setInterval(() => {
      this.flushLogs();
    }, 5 * 60 * 1000);
  }

  private setupBeforeUnloadHandler() {
    window.addEventListener('beforeunload', () => {
      // Синхронная отправка при закрытии страницы
      if (this.logs.length > 0) {
        navigator.sendBeacon('/api/logs', JSON.stringify({
          logs: this.logs,
          sessionId: this.sessionId,
          timestamp: new Date().toISOString()
        }));
      }
    });

    // Для Telegram WebApp используем их события
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.onEvent('mainButtonClicked', () => this.flushLogs());
      window.Telegram.WebApp.onEvent('backButtonClicked', () => this.flushLogs());
    }
  }

  private async syncStoredLogs() {
    try {
      const unsyncedLogs = await this.storageService.getUnsyncedLogs();
      if (unsyncedLogs.length > 0) {
        await this.remoteService.flushPendingLogs(unsyncedLogs);
      }
    } catch (error) {
      console.error('[LoggingService] Ошибка синхронизации сохраненных логов:', error);
    }
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private createLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      route: window.location.pathname
    };
  }

  debug(message: string, data?: any) {
    const entry = this.createLogEntry('debug', message, data);
    this.addLog(entry);
    if (import.meta.env.DEV) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  }

  info(message: string, data?: any) {
    const entry = this.createLogEntry('info', message, data);
    this.addLog(entry);
    console.info(`[INFO] ${message}`, data);
  }

  warn(message: string, data?: any) {
    const entry = this.createLogEntry('warn', message, data);
    this.addLog(entry);
    console.warn(`[WARN] ${message}`, data);
  }

  error(message: string, data?: any) {
    const entry = this.createLogEntry('error', message, data);
    this.addLog(entry);
    console.error(`[ERROR] ${message}`, data);
    
    // Немедленная отправка критических ошибок
    this.remoteService.flushPendingLogs([entry]);
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    
    // Сохраняем в IndexedDB для персистентности
    if (this.isInitialized) {
      this.storageService.storeLogs([entry]).catch(err => 
        console.error('[LoggingService] Ошибка сохранения в IndexedDB:', err)
      );
    }
    
    // Ограничиваем количество локальных логов
    if (this.logs.length > this.maxLocalLogs) {
      this.logs = this.logs.slice(-this.maxLocalLogs);
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  async flushLogs() {
    if (this.logs.length === 0) return;

    try {
      const logsToFlush = [...this.logs];
      
      // Отправляем через удаленный сервис
      await this.remoteService.flushPendingLogs(logsToFlush);
      
      // Помечаем как синхронизированные в storage
      await this.storageService.markLogsAsSynced(logsToFlush);
      
      // Очищаем локальные логи после успешной отправки
      this.clearLogs();
      
      console.info(`[LoggingService] Отправлено ${logsToFlush.length} логов`);
    } catch (error) {
      console.error('[LoggingService] Ошибка отправки логов:', error);
    }
  }

  async getStorageStats() {
    if (!this.isInitialized) {
      await this.initializeService();
    }
    return this.storageService.getStorageStats();
  }

  updateRemoteConfig(config: Parameters<LoggingRemoteService['updateConfig']>[0]) {
    this.remoteService.updateConfig(config);
  }

  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flushLogs();
  }
}

export default LoggingService;
