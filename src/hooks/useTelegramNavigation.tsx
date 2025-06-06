
import { useState, useCallback, useEffect } from 'react';
import { useTelegram } from '../providers/TelegramProvider';

export type TelegramRoute = 'dashboard' | 'lessons' | 'test' | 'analytics' | 'advanced-analytics' | 'lesson-detail' | 'subscription' | 'payment-success' | 'not-found';

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

  // Инициализация навигации только для зарегистрированных пользователей
  useEffect(() => {
    // Не инициализируем пока идет проверка регистрации
    if (registrationStatus === 'checking') {
      return;
    }

    // Навигация работает только для зарегистрированных пользователей
    if (!isRegistered) {
      return;
    }

    // Если уже инициализировано, не делаем повторную инициализацию
    if (navigation.isInitialized) {
      return;
    }

    // Проверяем Telegram WebApp deep link
    let initialRoute: TelegramRoute = 'dashboard';
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.start_param) {
      const startParam = window.Telegram.WebApp.initDataUnsafe.start_param;
      const validRoutes: TelegramRoute[] = ['dashboard', 'lessons', 'analytics', 'advanced-analytics'];
      if (validRoutes.includes(startParam as TelegramRoute)) {
        initialRoute = startParam as TelegramRoute;
      }
    }
    
    setNavigation({
      currentRoute: initialRoute,
      history: [{ route: initialRoute }],
      isInitialized: true
    });

    console.log('Navigation initialized for registered user:', { initialRoute, isRegistered });
  }, [isRegistered, registrationStatus, navigation.isInitialized]);

  const navigate = useCallback((route: TelegramRoute, params?: Record<string, any>) => {
    // Навигация доступна только зарегистрированным пользователям
    if (!isRegistered) {
      console.warn('Navigation blocked: user not registered');
      return;
    }

    // Проверка на существование роута
    const validRoutes: TelegramRoute[] = ['dashboard', 'lessons', 'test', 'analytics', 'advanced-analytics', 'lesson-detail', 'subscription', 'payment-success', 'not-found'];
    
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
  }, [hapticFeedback, showBackButton, hideBackButton, isRegistered]);

  const goBack = useCallback(() => {
    if (!isRegistered) {
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
  }, [hapticFeedback, hideBackButton, isRegistered]);

  return {
    currentRoute: navigation.currentRoute,
    params: navigation.params,
    navigate,
    goBack,
    canGoBack: navigation.history.length > 1,
    isNavigationReady: navigation.isInitialized && isRegistered
  };
};
