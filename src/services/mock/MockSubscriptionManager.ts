
import { N8NWebhookResponse } from '../registration/types';
import LoggingService from '../LoggingService';
import MockDataProvider from './MockDataProvider';
import MockStorageManager from './MockStorageManager';
import { SubscriptionUpdateData, UserUpdateData } from './types';

class MockSubscriptionManager {
  private logger: LoggingService;
  private mockDataProvider: MockDataProvider;
  private storageManager: MockStorageManager;

  constructor() {
    this.logger = LoggingService.getInstance();
    this.mockDataProvider = MockDataProvider.getInstance();
    this.storageManager = new MockStorageManager();
  }

  async updateSubscription(userId: string, subscriptionData: SubscriptionUpdateData): Promise<N8NWebhookResponse> {
    this.storageManager.validateMockAccess();
    
    try {
      const userData = this.storageManager.getUser(userId);
      if (!userData) {
        return {
          success: false,
          message: 'Пользователь не найден (Mock)'
        };
      }

      const updates: UserUpdateData = {
        subscription_status: subscriptionData.subscription_status || 'free'
      };

      if (subscriptionData.subscription_expires) {
        updates.subscription_expires = subscriptionData.subscription_expires;
      }

      const updatedUser = this.storageManager.updateUser(userId, updates);
      
      if (updatedUser) {
        // Обновляем также в MockDataProvider
        this.mockDataProvider.updateMockUser(userId, updates);
      }

      this.logger.info('MockSubscriptionManager: Подписка обновлена', { userId, subscriptionData });

      return {
        success: true,
        message: `Подписка обновлена (Mock режим v${this.mockDataProvider.getDataSetVersion()})`
      };
    } catch (error) {
      this.logger.error('MockSubscriptionManager: Ошибка обновления подписки', { error, userId });
      return {
        success: false,
        message: 'Ошибка при обновлении подписки в Mock режиме'
      };
    }
  }
}

export default MockSubscriptionManager;
