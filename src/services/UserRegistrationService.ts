export interface UserRegistrationData {
  user_id: string;
  username?: string;
  full_name: string;
  course_status: 'not_started' | 'in_progress' | 'paused' | 'completed';
  current_lesson: number;
  last_activity: string;
  score: number;
  subscription_status?: 'free' | 'premium' | 'vip';
  subscription_expires?: string;
  payment_provider?: string;
  telegram_data?: any;
}

export interface N8NWebhookResponse {
  success: boolean;
  message?: string;
  user_exists?: boolean;
  subscription_status?: any;
}

class UserRegistrationService {
  private static instance: UserRegistrationService;
  private baseWebhookUrl = 'https://your-n8n-webhook-url.com'; // Будет настраиваться пользователем

  static getInstance(): UserRegistrationService {
    if (!UserRegistrationService.instance) {
      UserRegistrationService.instance = new UserRegistrationService();
    }
    return UserRegistrationService.instance;
  }

  setWebhookUrl(url: string) {
    this.baseWebhookUrl = url;
  }

  async registerUser(userData: UserRegistrationData): Promise<N8NWebhookResponse> {
    try {
      console.log('Отправка данных пользователя в N8N:', userData);
      
      const response = await fetch(`${this.baseWebhookUrl}/webhook/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          subscription_status: 'free', // По умолчанию бесплатная подписка
          timestamp: new Date().toISOString(),
          action: 'register'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Ответ от N8N:', result);
      
      return {
        success: true,
        message: result.message || 'Регистрация успешна',
        user_exists: result.user_exists || false,
        subscription_status: result.subscription_status
      };
    } catch (error) {
      console.error('Ошибка регистрации пользователя:', error);
      return {
        success: false,
        message: 'Ошибка при регистрации. Попробуйте позже.'
      };
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
      console.error('Ошибка проверки пользователя:', error);
      return {
        success: false,
        message: 'Ошибка при проверке пользователя'
      };
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
      console.error('Ошибка обновления активности:', error);
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
      console.error('Ошибка обновления подписки:', error);
      return {
        success: false,
        message: 'Ошибка при обновлении подписки'
      };
    }
  }
}

export default UserRegistrationService;
