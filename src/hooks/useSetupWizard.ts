
import { useState, useEffect } from 'react';

export interface SetupWizardState {
  isSetupRequired: boolean;
  isSetupCompleted: boolean;
  shouldShowWizard: boolean;
}

export const useSetupWizard = () => {
  const [setupState, setSetupState] = useState<SetupWizardState>({
    isSetupRequired: false,
    isSetupCompleted: false,
    shouldShowWizard: false
  });

  useEffect(() => {
    // Проверяем, нужно ли показать мастер настройки
    const checkSetupRequirement = () => {
      // Проверяем в localStorage признак завершенной настройки
      const setupCompleted = localStorage.getItem('setup_completed') === 'true';
      
      // Проверяем наличие основных настроек
      const hasTelegramConfig = localStorage.getItem('telegram_bot_configured') === 'true';
      const hasWebhookUrl = localStorage.getItem('n8n_webhook_url') !== null;
      
      // Проверяем URL параметры - возможно пользователь хочет запустить настройку заново
      const urlParams = new URLSearchParams(window.location.search);
      const forceSetup = urlParams.get('setup') === 'true';
      
      const isSetupRequired = !setupCompleted || forceSetup;
      const shouldShow = isSetupRequired && !setupCompleted;
      
      setSetupState({
        isSetupRequired,
        isSetupCompleted: setupCompleted,
        shouldShowWizard: shouldShow
      });
    };

    checkSetupRequirement();
  }, []);

  const completeSetup = () => {
    localStorage.setItem('setup_completed', 'true');
    setSetupState(prev => ({
      ...prev,
      isSetupCompleted: true,
      shouldShowWizard: false
    }));
  };

  const resetSetup = () => {
    localStorage.removeItem('setup_completed');
    localStorage.removeItem('telegram_bot_configured');
    localStorage.removeItem('n8n_webhook_url');
    setSetupState({
      isSetupRequired: true,
      isSetupCompleted: false,
      shouldShowWizard: true
    });
  };

  const skipSetup = () => {
    setSetupState(prev => ({
      ...prev,
      shouldShowWizard: false
    }));
  };

  return {
    ...setupState,
    completeSetup,
    resetSetup,
    skipSetup
  };
};
