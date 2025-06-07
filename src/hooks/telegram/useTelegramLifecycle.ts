
import { useEffect, useCallback } from 'react';
import LoggingService from '../../services/LoggingService';

export const useTelegramLifecycle = () => {
  const logger = LoggingService.getInstance();

  const handleViewportChanged = useCallback(() => {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      const height = webApp.viewportHeight || window.innerHeight;
      const isExpanded = webApp.isExpanded || false;
      
      // Обновляем CSS переменные для адаптивности
      document.documentElement.style.setProperty('--tg-viewport-height', `${height}px`);
      document.documentElement.style.setProperty('--tg-viewport-stable-height', `${height}px`);
      
      logger.debug('Telegram viewport changed', { height, isExpanded });
    }
  }, [logger]);

  const handleThemeChanged = useCallback(() => {
    if (window.Telegram?.WebApp) {
      const theme = window.Telegram.WebApp.colorScheme;
      document.documentElement.setAttribute('data-theme', theme);
      
      // Применяем цвета Telegram к CSS переменным
      if (window.Telegram.WebApp.themeParams) {
        const params = window.Telegram.WebApp.themeParams;
        const root = document.documentElement;
        
        if (params.bg_color) root.style.setProperty('--tg-bg-color', params.bg_color);
        if (params.text_color) root.style.setProperty('--tg-text-color', params.text_color);
        if (params.hint_color) root.style.setProperty('--tg-hint-color', params.hint_color);
        if (params.link_color) root.style.setProperty('--tg-link-color', params.link_color);
        if (params.button_color) root.style.setProperty('--tg-button-color', params.button_color);
        if (params.button_text_color) root.style.setProperty('--tg-button-text-color', params.button_text_color);
      }
      
      logger.debug('Telegram theme changed', { theme });
    }
  }, [logger]);

  const handleMainButtonClicked = useCallback(() => {
    logger.debug('Telegram main button clicked');
  }, [logger]);

  const handleBackButtonClicked = useCallback(() => {
    logger.debug('Telegram back button clicked');
    // Это обрабатывается в useTelegramNavigation
  }, [logger]);

  const handleSettingsButtonClicked = useCallback(() => {
    logger.debug('Telegram settings button clicked');
    // Можно добавить логику для открытия настроек
  }, [logger]);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      
      // Подписываемся на события жизненного цикла
      webApp.onEvent('viewportChanged', handleViewportChanged);
      webApp.onEvent('themeChanged', handleThemeChanged);
      webApp.onEvent('mainButtonClicked', handleMainButtonClicked);
      webApp.onEvent('backButtonClicked', handleBackButtonClicked);
      webApp.onEvent('settingsButtonClicked', handleSettingsButtonClicked);
      
      // Инициализация при монтировании
      handleViewportChanged();
      handleThemeChanged();
      
      return () => {
        webApp.offEvent('viewportChanged', handleViewportChanged);
        webApp.offEvent('themeChanged', handleThemeChanged);
        webApp.offEvent('mainButtonClicked', handleMainButtonClicked);
        webApp.offEvent('backButtonClicked', handleBackButtonClicked);
        webApp.offEvent('settingsButtonClicked', handleSettingsButtonClicked);
      };
    }
  }, [handleViewportChanged, handleThemeChanged, handleMainButtonClicked, handleBackButtonClicked, handleSettingsButtonClicked]);

  return {
    handleViewportChanged,
    handleThemeChanged
  };
};
