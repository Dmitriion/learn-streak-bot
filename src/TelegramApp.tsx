
import React, { useEffect } from 'react';
import { useTelegram } from './providers/TelegramProvider';
import { useTelegramNavigation } from './hooks/useTelegramNavigation';
import Dashboard from './pages/Dashboard';
import Lessons from './pages/Lessons';
import Test from './pages/Test';
import Analytics from './pages/Analytics';
import LessonDetail from './components/LessonDetail';
import Registration from './components/Registration';

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
    registerUser 
  } = useTelegram();
  const { currentRoute, params } = useTelegramNavigation();

  useEffect(() => {
    // Инициализируем Telegram App
    ready();
    expand();
  }, [ready, expand]);

  useEffect(() => {
    // Применяем тему Telegram к документу
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = theme === 'dark' ? 'dark' : '';
  }, [theme]);

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
              height: 100vh;
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
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 telegram-app">
      <style dangerouslySetInnerHTML={{
        __html: `
          .telegram-app {
            height: 100vh;
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
        `
      }} />
      {renderCurrentPage()}
    </div>
  );
};

export default TelegramApp;
