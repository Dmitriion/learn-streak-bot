import { useState, useCallback, useEffect } from 'react';
import { useTelegram } from '../providers/TelegramProvider';

export type TelegramRoute = 
  | 'dashboard'           // Главная панель
  | 'lessons'            // Список уроков
  | 'lesson-detail'      // Детали урока
  | 'test'              // Прохождение теста
  | 'analytics'         // Базовая аналитика
  | 'advanced-analytics' // Продвинутая аналитика
  | 'subscription'      // Управление подпиской
  | 'settings'          // Настройки
  | 'payment-success'   // Успешная оплата
  | 'admin'             // Админ-панель
  | 'not-found';        // 404 страница

interface NavigationState {
  currentRoute: TelegramRoute;
  params?: Record<string, any>;
  history: Array<{ route: TelegramRoute; params?: Record<string, any> }>;
  isInitialized: boolean;
}

export const useTelegramNavigation = () => {
  const { showBackButton, hideBackButton, hapticFeedback, isRegistered, registrationStatus } = useTelegram();
  
  const [navigation, setNavigation] = useState<NavigationState>({
    currentRoute: 'dashboard',
    history: [],
    isInitialized: false
  });

  // Инициализация навигации - упрощенная логика без блокировок
  useEffect(() => {
    // Инициализируем навигацию сразу когда статус известен
    if (registrationStatus === 'checking') {
      return; // Ждем только пока идет проверка
    }

    // Если уже инициализировано, не переинициализируем
    if (navigation.isInitialized) {
      return;
    }

    // Инициализируем навигацию независимо от статуса регистрации
    let initialRoute: TelegramRoute = 'dashboard';
    
    // Проверяем Telegram WebApp deep link только если в Telegram
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.start_param) {
      const startParam = window.Telegram.WebApp.initDataUnsafe.start_param;
      const validRoutes: TelegramRoute[] = ['dashboard', 'lessons', 'analytics', 'advanced-analytics', 'settings'];
      if (validRoutes.includes(startParam as TelegramRoute)) {
        initialRoute = startParam as TelegramRoute;
      }
    }
    
    setNavigation({
      currentRoute: initialRoute,
      history: [{ route: initialRoute }],
      isInitialized: true
    });

    console.log('Navigation initialized:', { 
      initialRoute, 
      isRegistered, 
      registrationStatus 
    });
  }, [registrationStatus, navigation.isInitialized, isRegistered]);

  const navigate = useCallback((route: TelegramRoute, params?: Record<string, any>) => {
    // Навигация доступна всегда когда инициализирована
    if (!navigation.isInitialized) {
      console.warn('Navigation not initialized yet');
      return;
    }

    // Проверка на существование роута
    const validRoutes: TelegramRoute[] = ['dashboard', 'lessons', 'test', 'analytics', 'advanced-analytics', 'lesson-detail', 'subscription', 'payment-success', 'settings', 'not-found'];
    
    if (!validRoutes.includes(route)) {
      console.warn('Unknown route:', route, 'Redirecting to not-found');
      route = 'not-found';
    }

    hapticFeedback('light');
    
    setNavigation(prev => ({
      ...prev,
      currentRoute: route,
      params,
      history: [...prev.history, { route, params }]
    }));

    // Показываем кнопку "Назад" если не на главной странице
    if (route !== 'dashboard') {
      showBackButton(() => goBack());
    } else {
      hideBackButton();
    }

    console.log('Navigated to:', route, params);
  }, [hapticFeedback, showBackButton, hideBackButton, navigation.isInitialized]);

  const goBack = useCallback(() => {
    if (!navigation.isInitialized) {
      return;
    }

    hapticFeedback('light');
    
    setNavigation(prev => {
      const newHistory = [...prev.history];
      newHistory.pop(); // Удаляем текущую страницу
      
      const previousPage = newHistory[newHistory.length - 1] || { route: 'dashboard' };
      
      if (previousPage.route === 'dashboard') {
        hideBackButton();
      }
      
      return {
        ...prev,
        currentRoute: previousPage.route,
        params: previousPage.params,
        history: newHistory
      };
    });
  }, [hapticFeedback, hideBackButton, navigation.isInitialized]);

  return {
    currentRoute: navigation.currentRoute,
    params: navigation.params,
    navigate,
    goBack,
    canGoBack: navigation.history.length > 1,
    // Навигация готова когда инициализирована, независимо от регистрации
    isNavigationReady: navigation.isInitialized
  };
};
