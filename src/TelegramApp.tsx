
import React, { useEffect } from 'react';
import { useTelegram } from './providers/TelegramProvider';
import { useTelegramNavigation } from './hooks/useTelegramNavigation';
import { useAppInitialization } from './hooks/useAppInitialization';
import { useThemeAndViewport } from './hooks/useThemeAndViewport';
import { useSetupWizard } from './hooks/useSetupWizard';
import TelegramProductionService from './services/TelegramProductionService';
import BuildValidator from './services/BuildValidator';
import TelegramErrorBoundary from './components/telegram/TelegramErrorBoundary';
import AppLoader from './components/app/AppLoader';
import AppStyles from './components/app/AppStyles';
import AppRouter from './components/app/AppRouter';
import Registration from './components/Registration';
import SetupWizard from './components/setup/SetupWizard';

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
  const { shouldShowWizard, completeSetup } = useSetupWizard();

  useAppInitialization();
  useThemeAndViewport({ theme, viewportHeight });

  // Инициализируем production сервисы
  useEffect(() => {
    const productionService = TelegramProductionService.getInstance();
    const buildValidator = BuildValidator.getInstance();
    
    productionService.initializeProduction();
    
    const isValidEnvironment = productionService.validateEnvironment();
    if (!isValidEnvironment) {
      console.warn('Environment validation failed');
    }
    
    if (import.meta.env.DEV) {
      const readiness = buildValidator.getProductionReadinessStatus();
      console.log(`Production readiness: ${readiness.score}%`, readiness.checks);
    }
  }, []);

  // Показываем загрузчик только во время начальной проверки
  if (!isReady || registrationStatus === 'checking') {
    return <AppLoader />;
  }

  // Показываем мастер настройки если требуется
  if (shouldShowWizard) {
    return (
      <TelegramErrorBoundary>
        <SetupWizard />
      </TelegramErrorBoundary>
    );
  }

  // Если пользователь аутентифицирован но не зарегистрирован - показываем регистрацию
  if (isAuthenticated && !isRegistered) {
    return (
      <TelegramErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 telegram-app">
          <AppStyles theme={theme} viewportHeight={viewportHeight} />
          <Registration
            onRegistrationComplete={registerUser}
            isLoading={registrationStatus === 'registering'}
            error={authError}
          />
        </div>
      </TelegramErrorBoundary>
    );
  }

  // Если пользователь зарегистрирован - показываем основное приложение
  if (isRegistered) {
    return (
      <TelegramErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 telegram-app">
          <AppStyles theme={theme} viewportHeight={viewportHeight} />
          <AppRouter 
            currentRoute={currentRoute} 
            params={params} 
            isLoading={!isNavigationReady}
          />
        </div>
      </TelegramErrorBoundary>
    );
  }

  // Fallback для неопределенных состояний - показываем основное приложение
  return (
    <TelegramErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 telegram-app">
        <AppStyles theme={theme} viewportHeight={viewportHeight} />
        <AppRouter 
          currentRoute={currentRoute} 
          params={params} 
          isLoading={!isNavigationReady}
        />
      </div>
    </TelegramErrorBoundary>
  );
};

export default TelegramApp;
