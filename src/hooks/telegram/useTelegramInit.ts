
import { useState, useEffect, useCallback, useRef } from 'react';
import LoggingService from '../../services/LoggingService';

export const useTelegramInit = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isReady, setIsReady] = useState(false);
  const [viewportHeight, setViewportHeight] = useState<number>(window.innerHeight);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosingConfirmationEnabled, setIsClosingConfirmationEnabled] = useState(false);
  
  const logger = LoggingService.getInstance();
  const initializationRef = useRef(false);

  const handleThemeChanged = useCallback(() => {
    if (window.Telegram?.WebApp) {
      const newTheme = window.Telegram.WebApp.colorScheme as 'light' | 'dark';
      setTheme(newTheme);
      logger.debug('Тема изменена', { theme: newTheme });
    }
  }, [logger]);

  const handleViewportChanged = useCallback(() => {
    if (window.Telegram?.WebApp) {
      const WebApp = window.Telegram.WebApp;
      const height = (WebApp as any).viewportHeight || window.innerHeight;
      const expanded = (WebApp as any).isExpanded || false;
      setViewportHeight(height);
      setIsExpanded(expanded);
      logger.debug('Viewport изменен', { height, expanded });
      
      document.documentElement.style.setProperty('--tg-viewport-height', `${height}px`);
    }
  }, [logger]);

  const handleSettingsButtonClicked = useCallback(() => {
    logger.info('Кнопка настроек нажата', {});
  }, [logger]);

  const handleMainButtonClicked = useCallback(() => {
    logger.debug('Main button clicked', {});
  }, [logger]);

  const handleBackButtonClicked = useCallback(() => {
    logger.debug('Back button clicked', {});
  }, [logger]);

  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const WebApp = window.Telegram.WebApp;
      
      logger.info('Инициализация Telegram WebApp', {});
      
      // Инициализируем WebApp
      WebApp.ready();
      WebApp.expand();
      
      // Устанавливаем начальные значения
      setTheme(WebApp.colorScheme as 'light' | 'dark');
      setViewportHeight((WebApp as any).viewportHeight || window.innerHeight);
      setIsExpanded((WebApp as any).isExpanded || false);
      
      // Подписываемся на события
      WebApp.onEvent('themeChanged', handleThemeChanged);
      WebApp.onEvent('viewportChanged', handleViewportChanged);
      WebApp.onEvent('settingsButtonClicked', handleSettingsButtonClicked);
      WebApp.onEvent('mainButtonClicked', handleMainButtonClicked);
      WebApp.onEvent('backButtonClicked', handleBackButtonClicked);

      // Включаем подтверждение закрытия для лучшего UX
      if ((WebApp as any).enableClosingConfirmation) {
        (WebApp as any).enableClosingConfirmation();
        setIsClosingConfirmationEnabled(true);
      }

      // Обрабатываем deep links если есть
      if (WebApp.initDataUnsafe?.start_param) {
        logger.info('Deep link detected', { startParam: WebApp.initDataUnsafe.start_param });
      }
      
      setIsReady(true);
      logger.info('Telegram WebApp инициализирован успешно', {});
    } else {
      console.warn('Telegram Web App не доступен, используем тестовые данные');
      setIsReady(true);
      
      const mockViewportHeight = window.innerHeight;
      setViewportHeight(mockViewportHeight);
      document.documentElement.style.setProperty('--tg-viewport-height', `${mockViewportHeight}px`);
    }

    return () => {
      if (window.Telegram?.WebApp) {
        const WebApp = window.Telegram.WebApp;
        WebApp.offEvent('themeChanged', handleThemeChanged);
        WebApp.offEvent('viewportChanged', handleViewportChanged);
        WebApp.offEvent('settingsButtonClicked', handleSettingsButtonClicked);
        WebApp.offEvent('mainButtonClicked', handleMainButtonClicked);
        WebApp.offEvent('backButtonClicked', handleBackButtonClicked);
      }
    };
  }, [handleThemeChanged, handleViewportChanged, handleSettingsButtonClicked, handleMainButtonClicked, handleBackButtonClicked, logger]);

  const enableClosingConfirmation = useCallback(() => {
    if (window.Telegram?.WebApp && (window.Telegram.WebApp as any).enableClosingConfirmation) {
      (window.Telegram.WebApp as any).enableClosingConfirmation();
      setIsClosingConfirmationEnabled(true);
      logger.debug('Подтверждение закрытия включено', {});
    }
  }, [logger]);

  const disableClosingConfirmation = useCallback(() => {
    if (window.Telegram?.WebApp && (window.Telegram.WebApp as any).disableClosingConfirmation) {
      (window.Telegram.WebApp as any).disableClosingConfirmation();
      setIsClosingConfirmationEnabled(false);
      logger.debug('Подтверждение закрытия отключено', {});
    }
  }, [logger]);

  const expand = useCallback(() => {
    if (window.Telegram?.WebApp?.expand) {
      window.Telegram.WebApp.expand();
      logger.debug('WebApp развернут', {});
    }
  }, [logger]);

  const ready = useCallback(() => {
    if (window.Telegram?.WebApp?.ready) {
      window.Telegram.WebApp.ready();
      logger.debug('WebApp готов', {});
    }
  }, [logger]);

  return {
    theme,
    isReady,
    viewportHeight,
    isExpanded,
    isClosingConfirmationEnabled,
    enableClosingConfirmation,
    disableClosingConfirmation,
    expand,
    ready
  };
};
