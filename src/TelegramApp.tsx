
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
import EnvGeneratorWizard from './components/setup/EnvGeneratorWizard';
import AdminPanel from './components/admin/AdminPanel';

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
  const { shouldShowWizard, isAdminAccess, configurationStatus } = useSetupWizard();

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

  // Показываем админ-панель если запрошена
  if (currentRoute === 'admin' && isAdminAccess) {
    return (
      <TelegramErrorBoundary>
        <AdminPanel />
      </TelegramErrorBoundary>
    );
  }

  // Показываем мастер настройки только администраторам
  if (shouldShowWizard && isAdminAccess) {
    return (
      <TelegramErrorBoundary>
        <EnvGeneratorWizard />
      </TelegramErrorBoundary>
    );
  }

  // Если приложение не настроено и пользователь не админ - показываем сообщение
  if (configurationStatus !== 'complete' && !isAdminAccess) {
    return (
      <TelegramErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Приложение настраивается
            </h2>
            <p className="text-gray-600 mb-6">
              Администратор настраивает приложение. Попробуйте зайти позже.
            </p>
            <div className="text-sm text-gray-500">
              Статус: {configurationStatus === 'partial' ? 'Частично настроено' : 'Требует настройки'}
            </div>
          </div>
        </div>
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

  // Основное приложение для зарегистрированных пользователей
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
