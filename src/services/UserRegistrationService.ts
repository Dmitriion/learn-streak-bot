
import MockBackendService from './MockBackendService';
import LoggingService from './LoggingService';

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
  private baseWebhookUrl = ''; // Пустой по умолчанию
  private mockBackend: MockBackendService;
  private logger: LoggingService;
  private useMockMode = true; // По умолчанию используем Mock режим

  constructor() {
    this.mockBackend = MockBackendService.getInstance();
    this.logger = LoggingService.getInstance();
    
    // Проверяем environment переменные
    const envWebhookUrl = (globalThis as any).__N8N_WEBHOOK_URL__ || '';
    if (envWebhookUrl) {
      this.setWebhookUrl(envWebhookUrl);
    }
  }

  static getInstance(): UserRegistrationService {
    if (!UserRegistrationService.instance) {
      UserRegistrationService.instance = new UserRegistrationService();
    }
    return UserRegistrationService.instance;
  }

  setWebhookUrl(url: string) {
    this.baseWebhookUrl = url;
    this.useMockMode = !url || url.length === 0;
    
    this.logger.info('UserRegistrationService: Webhook URL установлен', { 
      url: url ? '***configured***' : 'empty',
      useMockMode: this.useMockMode 
    });
  }

  isUsingMockMode(): boolean {
    return this.useMockMode;
  }

  async registerUser(userData: UserRegistrationData): Promise<N8NWebhookResponse> {
    if (this.useMockMode) {
      return this.mockBackend.registerUser(userData);
    }

    try {
      this.logger.info('UserRegistrationService: Отправка данных пользователя в N8N', { userId: userData.user_id });
      
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
      this.logger.info('UserRegistrationService: Ответ от N8N', result);
      
      return {
        success: true,
        message: result.message || 'Регистрация успешна',
        user_exists: result.user_exists || false,
        subscription_status: result.subscription_status
      };
    } catch (error) {
      this.logger.error('UserRegistrationService: Ошибка регистрации пользователя', { error, userId: userData.user_id });
      
      // Fallback на Mock режим при ошибке
      this.logger.warn('UserRegistrationService: Переключение на Mock режим из-за ошибки');
      return this.mockBackend.registerUser(userData);
    }
  }

  async checkUserExists(userId: string): Promise<N8NWebhookResponse> {
    if (this.useMockMode) {
      return this.mockBackend.checkUserExists(userId);
    }

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
      this.logger.error('UserRegistrationService: Ошибка проверки пользователя', { error, userId });
      
      // Fallback на Mock режим при ошибке
      return this.mockBackend.checkUserExists(userId);
    }
  }

  async updateUserActivity(userId: string): Promise<void> {
    if (this.useMockMode) {
      return this.mockBackend.updateUserActivity(userId);
    }

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
      this.logger.error('UserRegistrationService: Ошибка обновления активности', { error, userId });
      // Fallback на Mock режим
      return this.mockBackend.updateUserActivity(userId);
    }
  }

  async updateSubscription(userId: string, subscriptionData: any): Promise<N8NWebhookResponse> {
    if (this.useMockMode) {
      return this.mockBackend.updateSubscription(userId, subscriptionData);
    }

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
      this.logger.error('UserRegistrationService: Ошибка обновления подписки', { error, userId });
      
      // Fallback на Mock режим при ошибке
      return this.mockBackend.updateSubscription(userId, subscriptionData);
    }
  }

  // Методы для управления Mock режимом
  getMockData() {
    return this.mockBackend.getAllUsers();
  }

  clearMockData() {
    this.mockBackend.clearAllData();
  }
}

export default UserRegistrationService;
