
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Users, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSetupWizard } from '../../hooks/useSetupWizard';
import AdminAccessManager from '../../services/admin/AdminAccessManager';
import EnvironmentManager from '../../services/environment/EnvironmentManager';
import { useTelegram } from '../../providers/TelegramProvider';

const AdminPanel: React.FC = () => {
  const { user } = useTelegram();
  const { forceShowSetup, configurationStatus } = useSetupWizard();
  const adminManager = AdminAccessManager.getInstance();
  const environmentManager = EnvironmentManager.getInstance();

  const adminConfig = adminManager.getAdminConfig();
  const hasAdminAccess = adminManager.hasAdminAccess(user?.id);

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Доступ запрещен</h2>
            <p className="text-muted-foreground">
              У вас нет прав доступа к административной панели
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = () => {
    switch (configurationStatus) {
      case 'complete':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Настроено</Badge>;
      case 'partial':
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Частично</Badge>;
      case 'missing':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Требует настройки</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Заголовок */}
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Административная панель
          </h1>
          <p className="text-lg text-muted-foreground">
            Управление настройками и мониторинг приложения
          </p>
        </div>

        {/* Статус конфигурации */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Статус конфигурации</span>
              </span>
              {getStatusBadge()}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Environment</h4>
                <p className="text-sm text-muted-foreground">
                  Режим: {environmentManager.getMode()}
                </p>
                <Badge variant={environmentManager.isProduction() ? "default" : "secondary"}>
                  {environmentManager.isProduction() ? "Production" : "Development"}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">N8N Integration</h4>
                <p className="text-sm text-muted-foreground">
                  {import.meta.env.VITE_N8N_WEBHOOK_URL ? 'Настроено' : 'Не настроено'}
                </p>
                <Badge variant={import.meta.env.VITE_N8N_WEBHOOK_URL ? "default" : "destructive"}>
                  {import.meta.env.VITE_N8N_WEBHOOK_URL ? "Активно" : "Требует настройки"}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Mock Mode</h4>
                <p className="text-sm text-muted-foreground">
                  {environmentManager.shouldUseMockData() ? 'Включен' : 'Отключен'}
                </p>
                <Badge variant={environmentManager.shouldUseMockData() ? "destructive" : "default"}>
                  {environmentManager.shouldUseMockData() ? "Mock данные" : "Production данные"}
                </Badge>
              </div>
            </div>

            {configurationStatus !== 'complete' && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span className="font-medium text-amber-800">Требуется настройка</span>
                </div>
                <p className="text-sm text-amber-700 mb-3">
                  Приложение не полностью настроено для production использования.
                </p>
                <Button
                  onClick={forceShowSetup}
                  variant="outline"
                  size="sm"
                >
                  Открыть мастер настройки
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Информация об администраторах */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Управление доступом</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Текущий пользователь</h4>
                <div className="space-y-1">
                  <p className="text-sm">ID: {user?.id}</p>
                  <p className="text-sm">Имя: {user?.first_name} {user?.last_name}</p>
                  <Badge variant="default">Администратор</Badge>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Конфигурация доступа</h4>
                <div className="space-y-1 text-sm">
                  <p>Админы: {adminConfig.adminUserIds.length > 0 ? adminConfig.adminUserIds.join(', ') : 'Не настроено'}</p>
                  <p>Dev режим: {adminConfig.devModeAccess ? 'Включен' : 'Отключен'}</p>
                  <p>Требует ?admin=true: {adminConfig.requireAdminParam ? 'Да' : 'Нет'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Быстрые действия */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Быстрые действия</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={forceShowSetup}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
              >
                <Settings className="h-6 w-6" />
                <span>Настройки</span>
              </Button>
              
              <Button
                onClick={() => window.location.href = '/settings'}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
              >
                <Activity className="h-6 w-6" />
                <span>Диагностика</span>
              </Button>
              
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
              >
                <Users className="h-6 w-6" />
                <span>Пользователи</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
