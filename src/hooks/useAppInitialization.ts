
import { useEffect } from 'react';
import { useTelegram } from '../providers/TelegramProvider';
import PerformanceService from '../services/PerformanceService';
import TelegramCloudStorage from '../services/TelegramCloudStorage';

export const useAppInitialization = () => {
  const { ready, expand, user } = useTelegram();

  useEffect(() => {
    // Инициализируем сервисы производительности
    const performanceService = PerformanceService.getInstance();
    const cloudStorage = TelegramCloudStorage.getInstance();
    
    const endAppLoadTiming = performanceService.startTiming('app_initialization');
    
    // Инициализируем Telegram App
    ready();
    expand();
    
    // Синхронизируем данные пользователя если он авторизован
    if (user?.id) {
      cloudStorage.syncData(user.id.toString());
    }
    
    endAppLoadTiming();
    
    // Cleanup при размонтировании
    return () => {
      performanceService.destroy();
    };
  }, [ready, expand, user]);
};
