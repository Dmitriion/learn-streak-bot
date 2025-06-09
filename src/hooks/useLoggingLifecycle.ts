
import { useEffect } from 'react';
import LoggingService from '../services/LoggingService';
import { useTelegram } from '../providers/TelegramProvider';

export const useLoggingLifecycle = () => {
  const { user } = useTelegram();
  const logger = LoggingService.getInstance();

  useEffect(() => {
    // Устанавливаем userId если пользователь авторизован
    if (user?.id) {
      logger.setUserId(user.id.toString());
    }
  }, [user, logger]);

  useEffect(() => {
    // Cleanup при размонтировании компонента
    return () => {
      logger.destroy();
    };
  }, [logger]);

  const flushLogs = async () => {
    await logger.flushLogs();
  };

  const getStorageStats = async () => {
    return await logger.getStorageStats();
  };

  return {
    flushLogs,
    getStorageStats
  };
};
