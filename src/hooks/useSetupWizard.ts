
import { useState, useEffect } from 'react';
import AdminAccessManager from '../services/admin/AdminAccessManager';
import EnvironmentManager from '../services/environment/EnvironmentManager';
import { useTelegram } from '../providers/TelegramProvider';

export interface SetupWizardState {
  isSetupRequired: boolean;
  isSetupCompleted: boolean;
  shouldShowWizard: boolean;
  isAdminAccess: boolean;
  configurationStatus: 'complete' | 'partial' | 'missing';
}

export const useSetupWizard = () => {
  const { user } = useTelegram();
  const [setupState, setSetupState] = useState<SetupWizardState>({
    isSetupRequired: false,
    isSetupCompleted: false,
    shouldShowWizard: false,
    isAdminAccess: false,
    configurationStatus: 'missing'
  });

  const adminManager = AdminAccessManager.getInstance();
  const environmentManager = EnvironmentManager.getInstance();

  useEffect(() => {
    checkSetupRequirement();
  }, [user]);

  const checkSetupRequirement = () => {
    const userId = user?.id;
    const isAdminAccess = adminManager.hasAdminAccess(userId);
    const shouldShowWizard = adminManager.shouldShowSetupWizard(userId);
    
    // Определяем статус конфигурации на основе environment переменных
    const configurationStatus = getConfigurationStatus();
    const isSetupCompleted = configurationStatus === 'complete';
    const isSetupRequired = configurationStatus !== 'complete';

    adminManager.logAdminAccess(userId, 'setup_wizard_check');

    setSetupState({
      isSetupRequired,
      isSetupCompleted,
      shouldShowWizard,
      isAdminAccess,
      configurationStatus
    });
  };

  const getConfigurationStatus = (): 'complete' | 'partial' | 'missing' => {
    const strategy = environmentManager.getStrategy();
    const validation = strategy.validateConfiguration();

    if (environmentManager.isProduction()) {
      // В production требуем полную конфигурацию
      return validation.isValid && validation.errors.length === 0 ? 'complete' : 'missing';
    }

    // В development проверяем наличие основных настроек
    const hasWebhookUrl = !!import.meta.env.VITE_N8N_WEBHOOK_URL;
    
    if (hasWebhookUrl) {
      return validation.errors.length === 0 ? 'complete' : 'partial';
    }

    return 'missing';
  };

  const completeSetup = () => {
    // В новой архитектуре setup завершается через environment переменные
    // Этот метод теперь просто скрывает мастер для текущей сессии
    setSetupState(prev => ({
      ...prev,
      shouldShowWizard: false
    }));
  };

  const resetSetup = () => {
    // Сброс setup теперь означает показать мастер админу заново
    const userId = user?.id;
    if (adminManager.hasAdminAccess(userId)) {
      setSetupState(prev => ({
        ...prev,
        shouldShowWizard: true
      }));
    }
  };

  const skipSetup = () => {
    setSetupState(prev => ({
      ...prev,
      shouldShowWizard: false
    }));
  };

  const forceShowSetup = () => {
    // Принудительный показ мастера (для админ-панели)
    const userId = user?.id;
    if (adminManager.hasAdminAccess(userId)) {
      setSetupState(prev => ({
        ...prev,
        shouldShowWizard: true
      }));
    }
  };

  return {
    ...setupState,
    completeSetup,
    resetSetup,
    skipSetup,
    forceShowSetup,
    getConfigurationStatus
  };
};
