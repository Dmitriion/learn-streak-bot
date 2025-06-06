
import { useState, useEffect, useCallback, useRef } from 'react';
import TelegramCloudStorage from '../services/TelegramCloudStorage';
import LoggingService from '../services/LoggingService';

export const useTelegramWebApp = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isReady, setIsReady] = useState(false);
  const [viewportHeight, setViewportHeight] = useState<number>(window.innerHeight);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosingConfirmationEnabled, setIsClosingConfirmationEnabled] = useState(false);
  
  const cloudStorage = TelegramCloudStorage.getInstance();
  const logger = LoggingService.getInstance();
  const initializationRef = useRef(false);

  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const WebApp = window.Telegram.WebApp;
      
      logger.info('Инициализация Telegram WebApp');
      
      // Основная инициализация
      WebApp.ready();
      WebApp.expand();
      
      setTheme(WebApp.colorScheme as 'light' | 'dark');
      setViewportHeight(WebApp.viewportHeight || window.innerHeight);
      setIsExpanded(WebApp.isExpanded);
      
      // Event listeners
      WebApp.onEvent('themeChanged', () => {
        const newTheme = WebApp.colorScheme as 'light' | 'dark';
        setTheme(newTheme);
        logger.debug('Тема изменена', { theme: newTheme });
      });
      
      WebApp.onEvent('viewportChanged', ({ height, isExpanded: expanded }) => {
        setViewportHeight(height);
        setIsExpanded(expanded);
        logger.debug('Viewport изменен', { height, expanded });
        
        // Обновляем CSS переменные для адаптивности
        document.documentElement.style.setProperty('--tg-viewport-height', `${height}px`);
      });

      // Lifecycle events
      WebApp.onEvent('settingsButtonClicked', () => {
        logger.info('Кнопка настроек нажата');
        // Здесь можно открыть modal с настройками
      });

      // Closing confirmation
      WebApp.enableClosingConfirmation();
      setIsClosingConfirmationEnabled(true);
      
      setIsReady(true);
      logger.info('Telegram WebApp инициализирован успешно');
    } else {
      console.warn('Telegram Web App не доступен, используем тестовые данные');
      setIsReady(true);
      
      // Симуляция для разработки
      const mockViewportHeight = window.innerHeight;
      setViewportHeight(mockViewportHeight);
      document.documentElement.style.setProperty('--tg-viewport-height', `${mockViewportHeight}px`);
    }

    // Cleanup function
    return () => {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.offEvent('themeChanged');
        window.Telegram.WebApp.offEvent('viewportChanged');
        window.Telegram.WebApp.offEvent('settingsButtonClicked');
      }
    };
  }, []);

  const showMainButton = useCallback((text: string, onClick: () => void) => {
    if (window.Telegram?.WebApp?.MainButton) {
      const MainButton = window.Telegram.WebApp.MainButton;
      MainButton.setText(text);
      MainButton.show();
      MainButton.onClick(onClick);
      logger.debug('MainButton показана', { text });
    }
  }, []);

  const hideMainButton = useCallback(() => {
    if (window.Telegram?.WebApp?.MainButton) {
      window.Telegram.WebApp.MainButton.hide();
      logger.debug('MainButton скрыта');
    }
  }, []);

  const showBackButton = useCallback((onClick: () => void) => {
    if (window.Telegram?.WebApp?.BackButton) {
      const BackButton = window.Telegram.WebApp.BackButton;
      BackButton.show();
      BackButton.onClick(onClick);
      logger.debug('BackButton показана');
    }
  }, []);

  const hideBackButton = useCallback(() => {
    if (window.Telegram?.WebApp?.BackButton) {
      window.Telegram.WebApp.BackButton.hide();
      logger.debug('BackButton скрыта');
    }
  }, []);

  const hapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
      logger.debug('Haptic feedback', { type });
    }
  }, []);

  const showAlert = useCallback((message: string) => {
    if (window.Telegram?.WebApp?.showAlert) {
      window.Telegram.WebApp.showAlert(message);
    } else {
      alert(message);
    }
    logger.debug('Alert показан', { message });
  }, []);

  const showConfirm = useCallback((message: string, callback: (confirmed: boolean) => void) => {
    if (window.Telegram?.WebApp?.showConfirm) {
      window.Telegram.WebApp.showConfirm(message, callback);
    } else {
      callback(confirm(message));
    }
    logger.debug('Confirm показан', { message });
  }, []);

  const expand = useCallback(() => {
    if (window.Telegram?.WebApp?.expand) {
      window.Telegram.WebApp.expand();
      logger.debug('WebApp развернут');
    }
  }, []);

  const ready = useCallback(() => {
    if (window.Telegram?.WebApp?.ready) {
      window.Telegram.WebApp.ready();
      logger.debug('WebApp готов');
    }
  }, []);

  // Новые методы для улучшенного UX
  const enableClosingConfirmation = useCallback(() => {
    if (window.Telegram?.WebApp?.enableClosingConfirmation) {
      window.Telegram.WebApp.enableClosingConfirmation();
      setIsClosingConfirmationEnabled(true);
      logger.debug('Подтверждение закрытия включено');
    }
  }, []);

  const disableClosingConfirmation = useCallback(() => {
    if (window.Telegram?.WebApp?.disableClosingConfirmation) {
      window.Telegram.WebApp.disableClosingConfirmation();
      setIsClosingConfirmationEnabled(false);
      logger.debug('Подтверждение закрытия отключено');
    }
  }, []);

  const openTelegramLink = useCallback((url: string) => {
    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(url);
      logger.debug('Telegram ссылка открыта', { url });
    }
  }, []);

  const openInvoice = useCallback((url: string, callback?: (status: string) => void) => {
    if (window.Telegram?.WebApp?.openInvoice) {
      window.Telegram.WebApp.openInvoice(url, callback);
      logger.debug('Invoice открыт', { url });
    }
  }, []);

  // Методы для работы с CloudStorage
  const saveToCloud = useCallback(async (key: string, data: any) => {
    return await cloudStorage.setItem(key, data);
  }, [cloudStorage]);

  const loadFromCloud = useCallback(async (key: string) => {
    return await cloudStorage.getItem(key);
  }, [cloudStorage]);

  return {
    theme,
    isReady,
    viewportHeight,
    isExpanded,
    isClosingConfirmationEnabled,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    hapticFeedback,
    showAlert,
    showConfirm,
    expand,
    ready,
    enableClosingConfirmation,
    disableClosingConfirmation,
    openTelegramLink,
    openInvoice,
    saveToCloud,
    loadFromCloud,
    cloudStorage
  };
};
