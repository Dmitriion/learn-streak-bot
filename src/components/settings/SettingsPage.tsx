
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import SettingsHeader from './SettingsHeader';
import WebhookSettings from './WebhookSettings';
import EnvironmentInfo from './EnvironmentInfo';
import MockDataManager from './MockDataManager';
import QuickActions from './QuickActions';
import ProductionReadiness from '../dev/ProductionReadiness';
import ServiceDiagnostics from '../dev/ServiceDiagnostics';

const SettingsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <SettingsHeader />
        
        {/* Development компоненты */}
        {import.meta.env.DEV && (
          <>
            <ServiceDiagnostics />
            <ProductionReadiness />
          </>
        )}
        
        {/* Основные настройки */}
        <div className="grid gap-6 md:grid-cols-2">
          <WebhookSettings />
          <EnvironmentInfo />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <MockDataManager />
          <QuickActions />
        </div>
        
        {/* Информационная карточка */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              О приложении
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Образовательная платформа с интеграцией N8N автоматизации</p>
              <p>Версия: 1.0.0 | Среда: {import.meta.env.MODE}</p>
              <p>Платформа: Telegram Mini App</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
