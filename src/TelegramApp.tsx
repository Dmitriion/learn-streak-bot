
import React from 'react';
import { useTelegram } from './providers/TelegramProvider';
import { useTelegramNavigation } from './hooks/useTelegramNavigation';
import { useAppInitialization } from './hooks/useAppInitialization';
import { useThemeAndViewport } from './hooks/useThemeAndViewport';
import AppLoader from './components/app/AppLoader';
import AppStyles from './components/app/AppStyles';
import AppRouter from './components/app/AppRouter';
import Registration from './components/Registration';

const TelegramApp = () => {
  const { 
    isReady, 
    theme, 
    isAuthenticated, 
    isRegistered, 
    registrationStatus, 
    error: authError,
    registerUser,
    viewportHeight
  } = useTelegram();
  const { currentRoute, params } = useTelegramNavigation();

  useAppInitialization();
  useThemeAndViewport({ theme, viewportHeight });

  if (!isReady || registrationStatus === 'checking') {
    return <AppLoader />;
  }

  // Если пользователь не зарегистрирован, показываем экран регистрации
  if (isAuthenticated && !isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 telegram-app">
        <AppStyles theme={theme} viewportHeight={viewportHeight} />
        <Registration
          onRegistrationComplete={registerUser}
          isLoading={registrationStatus === 'registering'}
          error={authError}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 telegram-app">
      <AppStyles theme={theme} viewportHeight={viewportHeight} />
      <AppRouter currentRoute={currentRoute} params={params} />
    </div>
  );
};

export default TelegramApp;
