import React, { useEffect } from 'react';
import { useTelegram } from './providers/TelegramProvider';
import { useTelegramNavigation } from './hooks/useTelegramNavigation';
import Dashboard from './pages/Dashboard';
import Lessons from './pages/Lessons';
import Test from './pages/Test';
import Analytics from './pages/Analytics';
import LessonDetail from './components/LessonDetail';
import Registration from './components/Registration';
import Subscription from './components/Subscription';
import PaymentSuccess from './components/PaymentSuccess';
import PerformanceService from './services/PerformanceService';
import TelegramCloudStorage from './services/TelegramCloudStorage';

const TelegramApp = () => {
  const { 
    isReady, 
    theme, 
    expand, 
    ready, 
    isAuthenticated, 
    isRegistered, 
    registrationStatus, 
    error: authError,
    registerUser,
    user,
    viewportHeight
  } = useTelegram();
  const { currentRoute, params } = useTelegramNavigation();

  useEffect(() => {
    // Инициализируем сервисы производительности
    const performanceService = PerformanceService.getInstance();
    const cloudStorage = TelegramCloudStorage.getInstance();
    
    const endAppLoadTiming = performanceService.startTiming('app_initialization');
    
    // Инициализируем Telegram App
    ready();
    expand();
    
    // Синхронизируем данные пользователя если он авторизован
    if (user?.id) {
      cloudStorage.syncData(user.id.toString());
    }
    
    endAppLoadTiming();
    
    // Cleanup при размонтировании
    return () => {
      performanceService.destroy();
    };
  }, [ready, expand, user]);

  useEffect(() => {
    // Применяем тему Telegram к документу
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = theme === 'dark' ? 'dark' : '';
    
    // Устанавливаем CSS переменные для viewport
    document.documentElement.style.setProperty('--tg-viewport-height', `${viewportHeight}px`);
  }, [theme, viewportHeight]);

  if (!isReady || registrationStatus === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-lg text-muted-foreground">Загрузка приложения...</p>
        </div>
      </div>
    );
  }

  // Если пользователь не зарегистрирован, показываем экран регистрации
  if (isAuthenticated && !isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 telegram-app">
        <style dangerouslySetInnerHTML={{
          __html: `
            .telegram-app {
              height: var(--tg-viewport-height, 100vh);
              overflow-y: auto;
              -webkit-overflow-scrolling: touch;
            }
            
            [data-theme="dark"] {
              --background: 0 0% 7%;
              --foreground: 210 40% 98%;
              --card: 0 0% 7%;
              --card-foreground: 210 40% 98%;
              --primary: 210 40% 98%;
              --primary-foreground: 222.2 47.4% 11.2%;
              --secondary: 217.2 32.6% 17.5%;
              --secondary-foreground: 210 40% 98%;
              --muted: 217.2 32.6% 17.5%;
              --muted-foreground: 215 20.2% 65.1%;
              --accent: 217.2 32.6% 17.5%;
              --accent-foreground: 210 40% 98%;
              --border: 217.2 32.6% 17.5%;
              --input: 217.2 32.6% 17.5%;
            }
            
            [data-theme="dark"] .bg-gradient-to-br {
              background: linear-gradient(to bottom right, rgb(15 23 42), rgb(30 27 75), rgb(88 28 135));
            }
            
            /* Telegram-specific optimizations */
            @media (max-height: 600px) {
              .telegram-app {
                padding: 8px;
              }
            }
            
            /* Smooth transitions for viewport changes */
            .telegram-app * {
              transition: height 0.3s ease, padding 0.3s ease;
            }
          `
        }} />
        <Registration
          onRegistrationComplete={registerUser}
          isLoading={registrationStatus === 'registering'}
          error={authError}
        />
      </div>
    );
  }

  const renderCurrentPage = () => {
    const performanceService = PerformanceService.getInstance();
    
    // Измеряем время рендера каждой страницы
    return performanceService.measureComponentRender(`page_${currentRoute}`, () => {
      switch (currentRoute) {
        case 'dashboard':
          return <Dashboard />;
        case 'lessons':
          return <Lessons />;
        case 'test':
          return <Test />;
        case 'analytics':
          return <Analytics />;
        case 'lesson-detail':
          return <LessonDetail lessonId={params?.lessonId} />;
        case 'subscription':
          return <Subscription />;
        case 'payment-success':
          return <PaymentSuccess paymentId={params?.paymentId} planName={params?.planName} />;
        default:
          return <Dashboard />;
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 telegram-app">
      <style dangerouslySetInnerHTML={{
        __html: `
          .telegram-app {
            height: var(--tg-viewport-height, 100vh);
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }
          
          [data-theme="dark"] {
            --background: 0 0% 7%;
            --foreground: 210 40% 98%;
            --card: 0 0% 7%;
            --card-foreground: 210 40% 98%;
            --primary: 210 40% 98%;
            --primary-foreground: 222.2 47.4% 11.2%;
            --secondary: 217.2 32.6% 17.5%;
            --secondary-foreground: 210 40% 98%;
            --muted: 217.2 32.6% 17.5%;
            --muted-foreground: 215 20.2% 65.1%;
            --accent: 217.2 32.6% 17.5%;
            --accent-foreground: 210 40% 98%;
            --border: 217.2 32.6% 17.5%;
            --input: 217.2 32.6% 17.5%;
          }
          
          [data-theme="dark"] .bg-gradient-to-br {
            background: linear-gradient(to bottom right, rgb(15 23 42), rgb(30 27 75), rgb(88 28 135));
          }
          
          /* Telegram-specific optimizations */
          @media (max-height: 600px) {
            .telegram-app {
              padding: 8px;
            }
          }
          
          /* Performance optimizations */
          .telegram-app * {
            will-change: auto;
          }
          
          .telegram-app img {
            loading: lazy;
          }
          
          /* Smooth transitions for viewport changes */
          .telegram-app {
            transition: height 0.3s ease;
          }
        `
      }} />
      {renderCurrentPage()}
    </div>
  );
};

export default TelegramApp;
