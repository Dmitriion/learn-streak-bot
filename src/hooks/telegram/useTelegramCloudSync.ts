
import { useCallback } from 'react';
import TelegramCloudStorage from '../../services/TelegramCloudStorage';

export const useTelegramCloudSync = () => {
  const cloudStorage = TelegramCloudStorage.getInstance();

  const saveToCloud = useCallback(async (key: string, data: any) => {
    return await cloudStorage.setItem(key, data);
  }, [cloudStorage]);

  const loadFromCloud = useCallback(async (key: string) => {
    return await cloudStorage.getItem(key);
  }, [cloudStorage]);

  return {
    saveToCloud,
    loadFromCloud,
    cloudStorage
  };
};
