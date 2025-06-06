
import { useState, useCallback, useEffect } from 'react';
import { useTelegram } from '../providers/TelegramProvider';

export type TelegramRoute = 'dashboard' | 'lessons' | 'test' | 'analytics' | 'advanced-analytics' | 'lesson-detail' | 'registration' | 'subscription' | 'payment-success' | 'not-found';

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

  // Инициализация роута только после завершения проверки регистрации
  useEffect(() => {
    // Не инициализируем пока идет проверка
    if (registrationStatus === 'checking') {
      return;
    }

    // Если уже инициализировано, не делаем повторную инициализацию
    if (navigation.isInitialized) {
      return;
    }

    // Определяем начальный роут на основе статуса регистрации
    const initialRoute: TelegramRoute = isRegistered ? 'dashboard' : 'registration';
    
    setNavigation({
      currentRoute: initialRoute,
      history: [{ route: initialRoute }],
      isInitialized: true
    });

    console.log('Navigation initialized:', { initialRoute, isRegistered, registrationStatus });
  }, [isRegistered, registrationStatus, navigation.isInitialized]);

  const navigate = useCallback((route: TelegramRoute, params?: Record<string, any>) => {
    // Защищенные роуты - требуют регистрации
    const protectedRoutes: TelegramRoute[] = ['dashboard', 'lessons', 'test', 'analytics', 'advanced-analytics', 'lesson-detail', 'subscription', 'payment-success'];
    
    if (protectedRoutes.includes(route) && !isRegistered) {
      console.warn('Попытка доступа к защищенному роуту без регистрации');
      return;
    }

    // Проверка на существование роута
    const validRoutes: TelegramRoute[] = ['dashboard', 'lessons', 'test', 'analytics', 'advanced-analytics', 'lesson-detail', 'registration', 'subscription', 'payment-success', 'not-found'];
    
    if (!validRoutes.includes(route)) {
      console.warn('Неизвестный роут:', route, 'Перенаправление на not-found');
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
    hapticFeedback('light');
    
    setNavigation(prev => {
      const newHistory = [...prev.history];
      newHistory.pop(); // Удаляем текущую страницу
      
      const previousPage = newHistory[newHistory.length - 1] || { 
        route: isRegistered ? 'dashboard' : 'registration' 
      };
      
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
    isNavigationReady: navigation.isInitialized
  };
};
