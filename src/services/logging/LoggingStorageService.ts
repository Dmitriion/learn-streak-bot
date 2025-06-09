import { LogEntry } from '../LoggingService';

interface StoredLogEntry extends LogEntry {
  id?: number;
  synced: boolean;
}

class LoggingStorageService {
  private static instance: LoggingStorageService;
  private dbName = 'telegram-edu-logs';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  static getInstance(): LoggingStorageService {
    if (!LoggingStorageService.instance) {
      LoggingStorageService.instance = new LoggingStorageService();
    }
    return LoggingStorageService.instance;
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('logs')) {
          const store = db.createObjectStore('logs', { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('level', 'level');
          store.createIndex('synced', 'synced');
          store.createIndex('sessionId', 'sessionId');
        }
      };
    });
  }

  async storeLogs(logs: LogEntry[]): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['logs'], 'readwrite');
      const store = transaction.objectStore('logs');

      logs.forEach(log => {
        const storedLog: StoredLogEntry = { ...log, synced: false };
        store.add(storedLog);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getUnsyncedLogs(): Promise<LogEntry[]> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['logs'], 'readonly');
      const store = transaction.objectStore('logs');
      const index = store.index('synced');
      
      // Используем openCursor вместо getAll для фильтрации по boolean значению
      const request = index.openCursor(IDBKeyRange.only(false));
      const logs: LogEntry[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const { id, synced, ...log } = cursor.value as StoredLogEntry;
          logs.push(log);
          cursor.continue();
        } else {
          resolve(logs);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async markLogsAsSynced(logs: LogEntry[]): Promise<void> {
    if (!this.db || logs.length === 0) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['logs'], 'readwrite');
      const store = transaction.objectStore('logs');

      // Найдем записи по timestamp и sessionId для пометки как синхронизированные
      logs.forEach(log => {
        const index = store.index('timestamp');
        const request = index.openCursor(IDBKeyRange.only(log.timestamp));
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            const storedLog = cursor.value as StoredLogEntry;
            if (storedLog.sessionId === log.sessionId && storedLog.message === log.message) {
              cursor.update({ ...storedLog, synced: true });
            }
            cursor.continue();
          }
        };
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async cleanupOldLogs(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    if (!this.db) return;

    const cutoffTime = new Date(Date.now() - maxAge).toISOString();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['logs'], 'readwrite');
      const store = transaction.objectStore('logs');
      const index = store.index('timestamp');
      const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const storedLog = cursor.value as StoredLogEntry;
          if (storedLog.synced) {
            cursor.delete();
          }
          cursor.continue();
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getStorageStats(): Promise<{ total: number; synced: number; unsynced: number }> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['logs'], 'readonly');
      const store = transaction.objectStore('logs');
      
      let total = 0;
      let synced = 0;
      let unsynced = 0;

      const request = store.openCursor();
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const log = cursor.value as StoredLogEntry;
          total++;
          if (log.synced) {
            synced++;
          } else {
            unsynced++;
          }
          cursor.continue();
        } else {
          resolve({ total, synced, unsynced });
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }
}

export default LoggingStorageService;
