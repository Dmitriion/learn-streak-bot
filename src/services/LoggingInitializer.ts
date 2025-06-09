
import LoggingService from './LoggingService';
import AutomationManager from './automation/AutomationManager';

/**
 * Сервис для безопасной инициализации связи между LoggingService и AutomationManager
 * Решает проблему циклических зависимостей через отложенную инициализацию
 */
export class LoggingInitializer {
  private static instance: LoggingInitializer;
  private isInitialized = false;

  static getInstance(): LoggingInitializer {
    if (!LoggingInitializer.instance) {
      LoggingInitializer.instance = new LoggingInitializer();
    }
    return LoggingInitializer.instance;
  }

  /**
   * Инициализирует связь между LoggingService и AutomationManager
   * Должен вызываться после полной инициализации приложения
   */
  initializeLoggingIntegration() {
    if (this.isInitialized) {
      console.warn('[LoggingInitializer] Уже инициализирован');
      return;
    }

    try {
      console.info('[LoggingInitializer] Начинаем инициализацию логирования с автоматизацией');
      
      // Получаем экземпляры сервисов
      const loggingService = LoggingService.getInstance();
      const automationManager = AutomationManager.getInstance();
      
      // Получаем N8N интеграцию из AutomationManager
      const n8nIntegration = automationManager.getN8NIntegration();
      
      // Инициализируем N8N интеграцию в LoggingService
      loggingService.initializeN8NIntegration(n8nIntegration);
      
      this.isInitialized = true;
      console.info('[LoggingInitializer] Интеграция логирования с автоматизацией успешно инициализирована');
      
    } catch (error) {
      console.error('[LoggingInitializer] Ошибка инициализации интеграции логирования:', error);
    }
  }

  isLoggingIntegrationInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Сброс состояния для тестирования
   */
  reset() {
    this.isInitialized = false;
  }
}

export default LoggingInitializer;
