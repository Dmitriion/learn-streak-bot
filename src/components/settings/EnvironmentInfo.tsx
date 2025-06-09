
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database } from 'lucide-react';
import TelegramValidationService from '../../services/TelegramValidationService';
import UserRegistrationService from '../../services/UserRegistrationService';

const EnvironmentInfo: React.FC = () => {
  const validationService = TelegramValidationService.getInstance();
  const registrationService = UserRegistrationService.getInstance();
  
  const environmentInfo = validationService.getEnvironmentInfo();
  const isUsingMockMode = registrationService.isUsingMockMode();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Информация о среде
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span>Режим разработки:</span>
          <Badge variant={environmentInfo.isDevelopment ? "default" : "secondary"}>
            {environmentInfo.isDevelopment ? "Да" : "Нет"}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span>Telegram App:</span>
          <Badge variant={environmentInfo.isTelegramApp ? "default" : "secondary"}>
            {environmentInfo.isTelegramApp ? "Да" : "Нет"}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span>Платформа:</span>
          <Badge variant="outline">{environmentInfo.platform}</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span>Mock режим:</span>
          <Badge variant={isUsingMockMode ? "destructive" : "default"}>
            {isUsingMockMode ? "Активен" : "Отключен"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnvironmentInfo;
