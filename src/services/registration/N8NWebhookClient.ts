
import LoggingService from '../LoggingService';
import { UserRegistrationData, N8NWebhookResponse } from './types';

export class N8NWebhookClient {
  private logger: LoggingService;
  private baseWebhookUrl: string;

  constructor(baseWebhookUrl: string) {
    this.baseWebhookUrl = baseWebhookUrl;
    this.logger = LoggingService.getInstance();
  }

  async registerUser(userData: UserRegistrationData): Promise<N8NWebhookResponse> {
    try {
      this.logger.info('N8NWebhookClient: Отправка данных пользователя в N8N', { userId: userData.user_id });
      
      const response = await fetch(`${this.baseWebhookUrl}/webhook/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          subscription_status: 'free',
          timestamp: new Date().toISOString(),
          action: 'register'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      this.logger.info('N8NWebhookClient: Ответ от N8N', result);
      
      return {
        success: true,
        message: result.message || 'Регистрация успешна',
        user_exists: result.user_exists || false,
        subscription_status: result.subscription_status
      };
    } catch (error) {
      this.logger.error('N8NWebhookClient: Ошибка регистрации пользователя', { error, userId: userData.user_id });
      throw error;
    }
  }

  async checkUserExists(userId: string): Promise<N8NWebhookResponse> {
    try {
      const response = await fetch(`${this.baseWebhookUrl}/webhook/user/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          action: 'check_exists',
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        user_exists: result.user_exists || false,
        message: result.message,
        subscription_status: result.subscription_status
      };
    } catch (error) {
      this.logger.error('N8NWebhookClient: Ошибка проверки пользователя', { error, userId });
      throw error;
    }
  }

  async updateUserActivity(userId: string): Promise<void> {
    try {
      await fetch(`${this.baseWebhookUrl}/webhook/user/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          last_activity: new Date().toISOString(),
          action: 'update_activity'
        }),
      });
    } catch (error) {
      this.logger.error('N8NWebhookClient: Ошибка обновления активности', { error, userId });
      throw error;
    }
  }

  async updateSubscription(userId: string, subscriptionData: any): Promise<N8NWebhookResponse> {
    try {
      const response = await fetch(`${this.baseWebhookUrl}/webhook/subscription/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          ...subscriptionData,
          timestamp: new Date().toISOString(),
          action: 'update_subscription'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        message: result.message || 'Подписка обновлена'
      };
    } catch (error) {
      this.logger.error('N8NWebhookClient: Ошибка обновления подписки', { error, userId });
      throw error;
    }
  }
}
