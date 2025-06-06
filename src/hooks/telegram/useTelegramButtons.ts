
import { useCallback } from 'react';
import LoggingService from '../../services/LoggingService';

export const useTelegramButtons = () => {
  const logger = LoggingService.getInstance();

  const showMainButton = useCallback((text: string, onClick: () => void) => {
    if (window.Telegram?.WebApp?.MainButton) {
      const MainButton = window.Telegram.WebApp.MainButton;
      MainButton.setText(text);
      MainButton.show();
      MainButton.onClick(onClick);
      logger.debug('MainButton показана', { text });
    }
  }, [logger]);

  const hideMainButton = useCallback(() => {
    if (window.Telegram?.WebApp?.MainButton) {
      window.Telegram.WebApp.MainButton.hide();
      logger.debug('MainButton скрыта', {});
    }
  }, [logger]);

  const showBackButton = useCallback((onClick: () => void) => {
    if (window.Telegram?.WebApp?.BackButton) {
      const BackButton = window.Telegram.WebApp.BackButton;
      BackButton.show();
      BackButton.onClick(onClick);
      logger.debug('BackButton показана', {});
    }
  }, [logger]);

  const hideBackButton = useCallback(() => {
    if (window.Telegram?.WebApp?.BackButton) {
      window.Telegram.WebApp.BackButton.hide();
      logger.debug('BackButton скрыта', {});
    }
  }, [logger]);

  return {
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton
  };
};
