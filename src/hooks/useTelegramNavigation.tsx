
import { useState, useCallback } from 'react';
import { useTelegram } from '../providers/TelegramProvider';

export type TelegramRoute = 'dashboard' | 'lessons' | 'test' | 'analytics' | 'lesson-detail' | 'registration';

interface NavigationState {
  currentRoute: TelegramRoute;
  params?: Record<string, any>;
  history: Array<{ route: TelegramRoute; params?: Record<string, any> }>;
}

export const useTelegramNavigation = () => {
  const { showBackButton, hideBackButton, hapticFeedback, isRegistered } = useTelegram();
  
  const [navigation, setNavigation] = useState<NavigationState>({
    currentRoute: isRegistered ? 'dashboard' : 'registration',
    history: [{ route: isRegistered ? 'dashboard' : 'registration' }]
  });

  const navigate = useCallback((route: TelegramRoute, params?: Record<string, any>) => {
    // Защищенные роуты - требуют регистрации
    const protectedRoutes: TelegramRoute[] = ['dashboard', 'lessons', 'test', 'analytics', 'lesson-detail'];
    
    if (protectedRoutes.includes(route) && !isRegistered) {
      console.warn('Попытка доступа к защищенному роуту без регистрации');
      return;
    }

    hapticFeedback('light');
    
    setNavigation(prev => ({
      currentRoute: route,
      params,
      history: [...prev.history, { route, params }]
    }));

    // Показываем кнопку "Назад" если не на главной странице и не на регистрации
    if (route !== 'dashboard' && route !== 'registration') {
      showBackButton(() => goBack());
    } else {
      hideBackButton();
    }
  }, [hapticFeedback, showBackButton, hideBackButton, isRegistered]);

  const goBack = useCallback(() => {
    hapticFeedback('light');
    
    setNavigation(prev => {
      const newHistory = [...prev.history];
      newHistory.pop(); // Удаляем текущую страницу
      
      const previousPage = newHistory[newHistory.length - 1] || { 
        route: isRegistered ? 'dashboard' : 'registration' 
      };
      
      if (previousPage.route === 'dashboard' || previousPage.route === 'registration') {
        hideBackButton();
      }
      
      return {
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
    canGoBack: navigation.history.length > 1
  };
};
