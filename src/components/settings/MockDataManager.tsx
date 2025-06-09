
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useTelegram } from '../../providers/TelegramProvider';
import MockBackendService from '../../services/mock/MockBackendService';

const MockDataManager: React.FC = () => {
  const { hapticFeedback } = useTelegram();
  const mockBackendService = MockBackendService.getInstance();
  const mockUsers = mockBackendService.getAllUsers();

  const handleClearMockData = () => {
    if (confirm('Вы уверены, что хотите очистить все тестовые данные?')) {
      mockBackendService.clearAllData();
      hapticFeedback('heavy');
      window.location.reload();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Mock данные ({mockUsers.length} пользователей)</span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearMockData}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Очистить
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mockUsers.length === 0 ? (
          <p className="text-muted-foreground text-sm">Нет тестовых данных</p>
        ) : (
          <div className="space-y-2">
            {mockUsers.slice(0, 3).map((user, index) => (
              <div key={index} className="p-2 bg-muted rounded text-xs">
                <div className="font-medium">{user.full_name}</div>
                <div className="text-muted-foreground">
                  ID: {user.user_id} | Урок: {user.current_lesson} | Очки: {user.score}
                </div>
              </div>
            ))}
            {mockUsers.length > 3 && (
              <p className="text-xs text-muted-foreground">
                И еще {mockUsers.length - 3} пользователей...
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MockDataManager;
