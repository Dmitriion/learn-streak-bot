
import { useState, useCallback } from 'react';
import { useTelegram } from '../providers/TelegramProvider';

export type TelegramRoute = 'dashboard' | 'lessons' | 'test' | 'analytics' | 'lesson-detail';

interface NavigationState {
  currentRoute: TelegramRoute;
  params?: Record<string, any>;
  history: Array<{ route: TelegramRoute; params?: Record<string, any> }>;
}

export const useTelegramNavigation = () => {
  const { showBackButton, hideBackButton, hapticFeedback } = useTelegram();
  
  const [navigation, setNavigation] = useState<NavigationState>({
    currentRoute: 'dashboard',
    history: [{ route: 'dashboard' }]
  });

  const navigate = useCallback((route: TelegramRoute, params?: Record<string, any>) => {
    hapticFeedback('light');
    
    setNavigation(prev => ({
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
  }, [hapticFeedback, showBackButton, hideBackButton]);

  const goBack = useCallback(() => {
    hapticFeedback('light');
    
    setNavigation(prev => {
      const newHistory = [...prev.history];
      newHistory.pop(); // Удаляем текущую страницу
      
      const previousPage = newHistory[newHistory.length - 1] || { route: 'dashboard' };
      
      if (previousPage.route === 'dashboard') {
        hideBackButton();
      }
      
      return {
        currentRoute: previousPage.route,
        params: previousPage.params,
        history: newHistory
      };
    });
  }, [hapticFeedback, hideBackButton]);

  return {
    currentRoute: navigation.currentRoute,
    params: navigation.params,
    navigate,
    goBack,
    canGoBack: navigation.history.length > 1
  };
};
