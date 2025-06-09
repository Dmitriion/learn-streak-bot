
import React from 'react';
import UserRegistrationService from '../../services/UserRegistrationService';
import ProductionReadiness from '../dev/ProductionReadiness';
import SettingsHeader from './SettingsHeader';
import QuickActions from './QuickActions';
import EnvironmentInfo from './EnvironmentInfo';
import WebhookSettings from './WebhookSettings';
import MockDataManager from './MockDataManager';

const SettingsPage: React.FC = () => {
  const registrationService = UserRegistrationService.getInstance();
  const isUsingMockMode = registrationService.isUsingMockMode();

  return (
    <div className="p-4 space-y-6">
      <SettingsHeader />
      <QuickActions />
      <ProductionReadiness />
      <EnvironmentInfo />
      <WebhookSettings />
      {isUsingMockMode && <MockDataManager />}
    </div>
  );
};

export default SettingsPage;
