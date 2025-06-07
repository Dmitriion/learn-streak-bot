
import { UserRegistrationData, N8NWebhookResponse } from './UserRegistrationService';
import LoggingService from './LoggingService';

interface MockUserData extends UserRegistrationData {
  registration_date: string;
  subscription_status: 'free' | 'premium' | 'vip';
}

class MockBackendService {
  private static instance: MockBackendService;
  private logger: LoggingService;
  private localStorage_prefix = 'telegram_edu_app_';

  constructor() {
    this.logger = LoggingService.getInstance();
  }

  static getInstance(): MockBackendService {
    if (!MockBackendService.instance) {
      MockBackendService.instance = new MockBackendService();
    }
    return MockBackendService.instance;
  }

  private getStorageKey(key: string): string {
    return `${this.localStorage_prefix}${key}`;
  }

  async registerUser(userData: UserRegistrationData): Promise<N8NWebhookResponse> {
    try {
      this.logger.info('MockBackend: Регистрация пользователя', { userId: userData.user_id });
      
      const mockUserData: MockUserData = {
        ...userData,
        registration_date: new Date().toISOString(),
        subscription_status: 'free'
      };

      // Сохраняем в localStorage
      localStorage.setItem(
        this.getStorageKey(`user_${userData.user_id}`),
        JSON.stringify(mockUserData)
      );

      // Обновляем список пользователей
      this.updateUsersList(userData.user_id);

      return {
        success: true,
        message: 'Регистрация успешна (Mock режим)',
        user_exists: false,
        subscription_status: { status: 'free', expires: null }
      };
    } catch (error) {
      this.logger.error('MockBackend: Ошибка регистрации', { error, userId: userData.user_id });
      return {
        success: false,
        message: 'Ошибка при регистрации в Mock режиме'
      };
    }
  }

  async checkUserExists(userId: string): Promise<N8NWebhookResponse> {
    try {
      const userData = localStorage.getItem(this.getStorageKey(`user_${userId}`));
      const userExists = !!userData;

      let subscriptionStatus = { status: 'free', expires: null };
      
      if (userExists) {
        const parsedData: MockUserData = JSON.parse(userData);
        subscriptionStatus = {
          status: parsedData.subscription_status,
          expires: parsedData.subscription_expires || null
        };
      }

      this.logger.info('MockBackend: Проверка пользователя', { userId, userExists });

      return {
        success: true,
        user_exists: userExists,
        message: userExists ? 'Пользователь найден' : 'Пользователь не найден',
        subscription_status: subscriptionStatus
      };
    } catch (error) {
      this.logger.error('MockBackend: Ошибка проверки пользователя', { error, userId });
      return {
        success: false,
        message: 'Ошибка при проверке пользователя в Mock режиме'
      };
    }
  }

  async updateUserActivity(userId: string): Promise<void> {
    try {
      const userData = localStorage.getItem(this.getStorageKey(`user_${userId}`));
      if (userData) {
        const parsedData: MockUserData = JSON.parse(userData);
        parsedData.last_activity = new Date().toISOString();
        
        localStorage.setItem(
          this.getStorageKey(`user_${userId}`),
          JSON.stringify(parsedData)
        );
        
        this.logger.debug('MockBackend: Активность обновлена', { userId });
      }
    } catch (error) {
      this.logger.error('MockBackend: Ошибка обновления активности', { error, userId });
    }
  }

  async updateSubscription(userId: string, subscriptionData: any): Promise<N8NWebhookResponse> {
    try {
      const userData = localStorage.getItem(this.getStorageKey(`user_${userId}`));
      if (!userData) {
        return {
          success: false,
          message: 'Пользователь не найден'
        };
      }

      const parsedData: MockUserData = JSON.parse(userData);
      parsedData.subscription_status = subscriptionData.subscription_status || 'free';
      parsedData.subscription_expires = subscriptionData.subscription_expires;
      
      localStorage.setItem(
        this.getStorageKey(`user_${userId}`),
        JSON.stringify(parsedData)
      );

      this.logger.info('MockBackend: Подписка обновлена', { userId, subscriptionData });

      return {
        success: true,
        message: 'Подписка обновлена (Mock режим)'
      };
    } catch (error) {
      this.logger.error('MockBackend: Ошибка обновления подписки', { error, userId });
      return {
        success: false,
        message: 'Ошибка при обновлении подписки в Mock режиме'
      };
    }
  }

  private updateUsersList(userId: string): void {
    try {
      const existingUsers = localStorage.getItem(this.getStorageKey('users_list'));
      const usersList: string[] = existingUsers ? JSON.parse(existingUsers) : [];
      
      if (!usersList.includes(userId)) {
        usersList.push(userId);
        localStorage.setItem(this.getStorageKey('users_list'), JSON.stringify(usersList));
      }
    } catch (error) {
      this.logger.error('MockBackend: Ошибка обновления списка пользователей', { error });
    }
  }

  // Методы для отладки и управления Mock данными
  getAllUsers(): MockUserData[] {
    try {
      const usersList = localStorage.getItem(this.getStorageKey('users_list'));
      if (!usersList) return [];

      const users: string[] = JSON.parse(usersList);
      return users.map(userId => {
        const userData = localStorage.getItem(this.getStorageKey(`user_${userId}`));
        return userData ? JSON.parse(userData) : null;
      }).filter(Boolean);
    } catch (error) {
      this.logger.error('MockBackend: Ошибка получения всех пользователей', { error });
      return [];
    }
  }

  clearAllData(): void {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.localStorage_prefix)) {
          localStorage.removeItem(key);
        }
      });
      this.logger.info('MockBackend: Все данные очищены');
    } catch (error) {
      this.logger.error('MockBackend: Ошибка очистки данных', { error });
    }
  }
}

export default MockBackendService;
