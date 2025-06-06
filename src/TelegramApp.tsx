
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
  const { currentRoute, params, isNavigationReady } = useTelegramNavigation();

  useAppInitialization();
  useThemeAndViewport({ theme, viewportHeight });

  // Показываем загрузчик только во время начальной проверки
  if (!isReady || registrationStatus === 'checking') {
    return <AppLoader />;
  }

  // Если пользователь аутентифицирован но не зарегистрирован - показываем регистрацию
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

  // Если пользователь зарегистрирован - показываем основное приложение
  // УБИРАЕМ блокирующую проверку isNavigationReady
  if (isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 telegram-app">
        <AppStyles theme={theme} viewportHeight={viewportHeight} />
        <AppRouter 
          currentRoute={currentRoute} 
          params={params} 
          isLoading={!isNavigationReady} // Показываем загрузчик только пока навигация не готова
        />
      </div>
    );
  }

  // Fallback для неопределенных состояний - показываем основное приложение
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 telegram-app">
      <AppStyles theme={theme} viewportHeight={viewportHeight} />
      <AppRouter 
        currentRoute={currentRoute} 
        params={params} 
        isLoading={!isNavigationReady}
      />
    </div>
  );
};

export default TelegramApp;
