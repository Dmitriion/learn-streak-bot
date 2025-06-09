
import { useEffect } from 'react';
import { useTelegram } from '../providers/TelegramProvider';
import PerformanceService from '../services/PerformanceService';
import TelegramCloudStorage from '../services/TelegramCloudStorage';
import LoggingService from '../services/LoggingService';

export const useAppInitialization = () => {
  const { ready, expand, user } = useTelegram();

  useEffect(() => {
    // Инициализируем сервисы производительности
    const performanceService = PerformanceService.getInstance();
    const cloudStorage = TelegramCloudStorage.getInstance();
    const logger = LoggingService.getInstance();
    
    const endAppLoadTiming = performanceService.startTiming('app_initialization');
    
    logger.info('Инициализация приложения начата', { 
      environment: import.meta.env.MODE,
      userAgent: navigator.userAgent 
    });
    
    // Инициализируем Telegram App
    ready();
    expand();
    
    // Синхронизируем данные пользователя если он авторизован
    if (user?.id) {
      logger.setUserId(user.id.toString());
      cloudStorage.syncData(user.id.toString());
      logger.info('Пользователь авторизован', { 
        userId: user.id,
        username: user.username 
      });
    }
    
    endAppLoadTiming();
    logger.info('Инициализация приложения завершена');
    
    // Cleanup при размонтировании
    return () => {
      logger.info('Приложение завершает работу');
      logger.destroy();
      performanceService.destroy();
    };
  }, [ready, expand, user]);
};
