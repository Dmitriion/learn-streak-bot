
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

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
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
    console.debug(`[DEBUG] ${message}`, data);
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
    
    // Критические ошибки отправляем на сервер немедленно
    this.sendLogToServer(entry);
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    
    // Ограничиваем количество локальных логов
    if (this.logs.length > this.maxLocalLogs) {
      this.logs = this.logs.slice(-this.maxLocalLogs);
    }
  }

  private async sendLogToServer(entry: LogEntry) {
    try {
      // В production здесь должен быть реальный endpoint для логов
      if (process.env.NODE_ENV === 'production') {
        await fetch('/api/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry),
        });
      }
    } catch (error) {
      console.error('Ошибка отправки лога на сервер:', error);
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  // Отправка всех накопленных логов на сервер
  async flushLogs() {
    if (this.logs.length === 0) return;

    try {
      if (process.env.NODE_ENV === 'production') {
        await fetch('/api/logs/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.logs),
        });
        this.clearLogs();
      }
    } catch (error) {
      console.error('Ошибка отправки логов на сервер:', error);
    }
  }
}

export default LoggingService;
