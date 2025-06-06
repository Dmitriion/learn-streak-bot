
import { useCallback } from 'react';
import LoggingService from '../../services/LoggingService';

export const useTelegramUI = () => {
  const logger = LoggingService.getInstance();

  const hapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
      logger.debug('Haptic feedback', { type });
    }
  }, [logger]);

  const showAlert = useCallback((message: string) => {
    if (window.Telegram?.WebApp?.showAlert) {
      window.Telegram.WebApp.showAlert(message);
    } else {
      alert(message);
    }
    logger.debug('Alert показан', { message });
  }, [logger]);

  const showConfirm = useCallback((message: string, callback: (confirmed: boolean) => void) => {
    if (window.Telegram?.WebApp?.showConfirm) {
      window.Telegram.WebApp.showConfirm(message, callback);
    } else {
      callback(confirm(message));
    }
    logger.debug('Confirm показан', { message });
  }, [logger]);

  const openTelegramLink = useCallback((url: string) => {
    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(url);
      logger.debug('Telegram ссылка открыта', { url });
    }
  }, [logger]);

  const openInvoice = useCallback((url: string, callback?: (status: string) => void) => {
    if (window.Telegram?.WebApp?.openInvoice) {
      window.Telegram.WebApp.openInvoice(url, callback);
      logger.debug('Invoice открыт', { url });
    }
  }, [logger]);

  return {
    hapticFeedback,
    showAlert,
    showConfirm,
    openTelegramLink,
    openInvoice
  };
};
