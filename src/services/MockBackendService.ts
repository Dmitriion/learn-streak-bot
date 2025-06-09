
import { UserRegistrationData, N8NWebhookResponse } from './UserRegistrationService';
import LoggingService from './LoggingService';
import EnvironmentManager from './environment/EnvironmentManager';
import MockDataProvider from './mock/MockDataProvider';

interface MockUserData extends UserRegistrationData {
  registration_date: string;
  subscription_status: 'free' | 'premium' | 'vip';
  subscription_expires?: string;
}

class MockBackendService {
  private static instance: MockBackendService;
  private logger: LoggingService;
  private environmentManager: EnvironmentManager;
  private mockDataProvider: MockDataProvider;
  private localStorage_prefix = 'telegram_edu_app_';

  constructor() {
    this.logger = LoggingService.getInstance();
    this.environmentManager = EnvironmentManager.getInstance();
    this.mockDataProvider = MockDataProvider.getInstance();
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

  private validateMockAccess(): void {
    if (!this.environmentManager.shouldUseMockData()) {
      this.logger.error('MockBackendService: попытка доступа к mock данным в production');
      throw new Error('Mock данные недоступны в текущем режиме');
    }
  }

  async registerUser(userData: UserRegistrationData): Promise<N8NWebhookResponse> {
    this.validateMockAccess();
    
    try {
      this.logger.info('MockBackend: Регистрация пользователя', { userId: userData.user_id });
      
      const mockUserData: MockUserData = {
        ...userData,
        registration_date: new Date().toISOString(),
        subscription_status: 'free'
      };

      // Используем MockDataProvider для консистентности
      this.mockDataProvider.addMockUser(mockUserData);

      // Сохраняем также в localStorage для backward compatibility
      localStorage.setItem(
        this.getStorageKey(`user_${userData.user_id}`),
        JSON.stringify(mockUserData)
      );

      this.updateUsersList(userData.user_id);

      return {
        success: true,
        message: `Регистрация успешна (Mock режим v${this.mockDataProvider.getDataSetVersion()})`,
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
    this.validateMockAccess();
    
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
        message: userExists ? 'Пользователь найден (Mock)' : 'Пользователь не найден (Mock)',
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
    this.validateMockAccess();
    
    try {
      const userData = localStorage.getItem(this.getStorageKey(`user_${userId}`));
      if (userData) {
        const parsedData: MockUserData = JSON.parse(userData);
        parsedData.last_activity = new Date().toISOString();
        
        localStorage.setItem(
          this.getStorageKey(`user_${userId}`),
          JSON.stringify(parsedData)
        );
        
        // Обновляем также в MockDataProvider
        this.mockDataProvider.updateMockUser(userId, {
          last_activity: parsedData.last_activity
        });
        
        this.logger.debug('MockBackend: Активность обновлена', { userId });
      }
    } catch (error) {
      this.logger.error('MockBackend: Ошибка обновления активности', { error, userId });
    }
  }

  async updateSubscription(userId: string, subscriptionData: any): Promise<N8NWebhookResponse> {
    this.validateMockAccess();
    
    try {
      const userData = localStorage.getItem(this.getStorageKey(`user_${userId}`));
      if (!userData) {
        return {
          success: false,
          message: 'Пользователь не найден (Mock)'
        };
      }

      const parsedData: MockUserData = JSON.parse(userData);
      parsedData.subscription_status = subscriptionData.subscription_status || 'free';
      parsedData.subscription_expires = subscriptionData.subscription_expires;
      
      localStorage.setItem(
        this.getStorageKey(`user_${userId}`),
        JSON.stringify(parsedData)
      );

      // Обновляем также в MockDataProvider
      this.mockDataProvider.updateMockUser(userId, {
        subscription_status: parsedData.subscription_status,
        subscription_expires: parsedData.subscription_expires
      });

      this.logger.info('MockBackend: Подписка обновлена', { userId, subscriptionData });

      return {
        success: true,
        message: `Подписка обновлена (Mock режим v${this.mockDataProvider.getDataSetVersion()})`
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
    this.validateMockAccess();
    
    try {
      // Используем MockDataProvider как источник истины
      return this.mockDataProvider.getUserData();
    } catch (error) {
      this.logger.error('MockBackend: Ошибка получения всех пользователей', { error });
      return [];
    }
  }

  clearAllData(): void {
    this.validateMockAccess();
    
    try {
      // Очищаем localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.localStorage_prefix)) {
          localStorage.removeItem(key);
        }
      });
      
      // Очищаем MockDataProvider
      this.mockDataProvider.clearMockData();
      
      this.logger.info('MockBackend: Все данные очищены');
    } catch (error) {
      this.logger.error('MockBackend: Ошибка очистки данных', { error });
    }
  }

  // Новые методы для работы с улучшенной системой
  getMockDataVersion(): string {
    return this.mockDataProvider.getDataSetVersion();
  }

  exportMockData() {
    this.validateMockAccess();
    return this.mockDataProvider.exportMockData();
  }

  importMockData(dataSet: any) {
    this.validateMockAccess();
    this.mockDataProvider.importMockData(dataSet);
    this.logger.info('MockBackend: Mock данные импортированы');
  }
}

export default MockBackendService;
