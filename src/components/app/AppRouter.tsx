
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

interface AppRouterProps {
  currentRoute: string;
  params: Record<string, string>;
}

const AppRouter: React.FC<AppRouterProps> = ({ currentRoute, params }) => {
  switch (currentRoute) {
    case '/':
    case '/dashboard':
      return <Dashboard />;
    
    case '/lessons':
      return <Lessons />;
    
    case '/lesson':
      return <LessonDetail lessonId={parseInt(params.id || '1')} />;
    
    case '/test':
      return <Test lessonId={parseInt(params.id || '1')} />;
    
    case '/analytics':
      return <Analytics />;
    
    case '/advanced-analytics':
      return <AdvancedAnalytics />;
    
    case '/subscription':
      return <Subscription />;
    
    case '/payment-success':
      return <PaymentSuccess />;
    
    default:
      return <NotFound />;
  }
};

export default AppRouter;
