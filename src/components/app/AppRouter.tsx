
import React from 'react';
import Dashboard from '../../pages/Dashboard';
import Lessons from '../../pages/Lessons';
import Test from '../../pages/Test';
import Analytics from '../../pages/Analytics';
import AdvancedAnalytics from '../../pages/AdvancedAnalytics';
import LessonDetail from '../LessonDetail';
import Subscription from '../Subscription';
import PaymentSuccess from '../PaymentSuccess';
import NotFound from '../../pages/NotFound';
import AppLoader from './AppLoader';

interface AppRouterProps {
  currentRoute: string;
  params: Record<string, string>;
  isLoading?: boolean;
}

const AppRouter: React.FC<AppRouterProps> = ({ currentRoute, params, isLoading = false }) => {
  // Показываем загрузчик во время инициализации
  if (isLoading) {
    return <AppLoader />;
  }

  console.log('AppRouter: rendering route', currentRoute, 'with params', params);

  switch (currentRoute) {
    case '/':
    case '/dashboard':
    case 'dashboard':
      return <Dashboard />;
    
    case '/lessons':
    case 'lessons':
      return <Lessons />;
    
    case '/lesson':
    case 'lesson-detail':
      return <LessonDetail lessonId={parseInt(params.id || '1')} />;
    
    case '/test':
    case 'test':
      return <Test lessonId={parseInt(params.id || '1')} />;
    
    case '/analytics':
    case 'analytics':
      return <Analytics />;
    
    case '/advanced-analytics':
    case 'advanced-analytics':
      return <AdvancedAnalytics />;
    
    case '/subscription':
    case 'subscription':
      return <Subscription />;
    
    case '/payment-success':
    case 'payment-success':
      return <PaymentSuccess />;
    
    case 'not-found':
      return <NotFound />;
    
    default:
      console.warn('AppRouter: Unknown route', currentRoute, 'redirecting to NotFound');
      return <NotFound />;
  }
};

export default AppRouter;
