
import React from 'react';
import { TelegramRoute } from '../../hooks/useTelegramNavigation';
import Dashboard from '../../pages/Dashboard';
import Lessons from '../../pages/Lessons';
import Test from '../../pages/Test';
import Analytics from '../../pages/Analytics';
import LessonDetail from '../LessonDetail';
import Subscription from '../Subscription';
import PaymentSuccess from '../PaymentSuccess';
import PerformanceService from '../../services/PerformanceService';

interface AppRouterProps {
  currentRoute: TelegramRoute;
  params?: Record<string, any>;
}

const AppRouter: React.FC<AppRouterProps> = ({ currentRoute, params }) => {
  const performanceService = PerformanceService.getInstance();
  
  // Измеряем время рендера каждой страницы
  const endTiming = performanceService.startTiming(`page_${currentRoute}`);
  
  let pageComponent;
  switch (currentRoute) {
    case 'dashboard':
      pageComponent = <Dashboard />;
      break;
    case 'lessons':
      pageComponent = <Lessons />;
      break;
    case 'test':
      pageComponent = <Test />;
      break;
    case 'analytics':
      pageComponent = <Analytics />;
      break;
    case 'lesson-detail':
      pageComponent = <LessonDetail lessonId={params?.lessonId} />;
      break;
    case 'subscription':
      pageComponent = <Subscription />;
      break;
    case 'payment-success':
      pageComponent = <PaymentSuccess paymentId={params?.paymentId} planName={params?.planName} />;
      break;
    default:
      pageComponent = <Dashboard />;
  }
  
  endTiming();
  return pageComponent;
};

export default AppRouter;
