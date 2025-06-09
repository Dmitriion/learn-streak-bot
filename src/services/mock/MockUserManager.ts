
import { UserRegistrationData, N8NWebhookResponse } from '../registration/types';
import LoggingService from '../LoggingService';
import MockDataProvider from './MockDataProvider';
import MockStorageManager from './MockStorageManager';
import { MockUserData, UserUpdateData } from './types';

class MockUserManager {
  private logger: LoggingService;
  private mockDataProvider: MockDataProvider;
  private storageManager: MockStorageManager;

  constructor() {
    this.logger = LoggingService.getInstance();
    this.mockDataProvider = MockDataProvider.getInstance();
    this.storageManager = new MockStorageManager();
  }

  async registerUser(userData: UserRegistrationData): Promise<N8NWebhookResponse> {
    this.storageManager.validateMockAccess();
    
    try {
      this.logger.info('MockUserManager: Регистрация пользователя', { userId: userData.user_id });
      
      const mockUserData: MockUserData = {
        ...userData,
        registration_date: new Date().toISOString(),
        subscription_status: 'free'
      };

      // Используем MockDataProvider для консистентности
      this.mockDataProvider.addMockUser(mockUserData);

      // Сохраняем также в localStorage для backward compatibility
      this.storageManager.saveUser(mockUserData);

      return {
        success: true,
        message: `Регистрация успешна (Mock режим v${this.mockDataProvider.getDataSetVersion()})`,
        user_exists: false,
        subscription_status: { status: 'free', expires: null }
      };
    } catch (error) {
      this.logger.error('MockUserManager: Ошибка регистрации', { error, userId: userData.user_id });
      return {
        success: false,
        message: 'Ошибка при регистрации в Mock режиме'
      };
    }
  }

  async checkUserExists(userId: string): Promise<N8NWebhookResponse> {
    this.storageManager.validateMockAccess();
    
    try {
      const userData = this.storageManager.getUser(userId);
      const userExists = !!userData;

      let subscriptionStatus = { status: 'free', expires: null };
      
      if (userExists && userData) {
        subscriptionStatus = {
          status: userData.subscription_status,
          expires: userData.subscription_expires || null
        };
      }

      this.logger.info('MockUserManager: Проверка пользователя', { userId, userExists });

      return {
        success: true,
        user_exists: userExists,
        message: userExists ? 'Пользователь найден (Mock)' : 'Пользователь не найден (Mock)',
        subscription_status: subscriptionStatus
      };
    } catch (error) {
      this.logger.error('MockUserManager: Ошибка проверки пользователя', { error, userId });
      return {
        success: false,
        message: 'Ошибка при проверке пользователя в Mock режиме'
      };
    }
  }

  async updateUserActivity(userId: string): Promise<void> {
    this.storageManager.validateMockAccess();
    
    try {
      const updates: UserUpdateData = {
        last_activity: new Date().toISOString()
      };

      const updatedUser = this.storageManager.updateUser(userId, updates);
      
      if (updatedUser) {
        // Обновляем также в MockDataProvider
        this.mockDataProvider.updateMockUser(userId, updates);
        this.logger.debug('MockUserManager: Активность обновлена', { userId });
      }
    } catch (error) {
      this.logger.error('MockUserManager: Ошибка обновления активности', { error, userId });
    }
  }

  getAllUsers(): MockUserData[] {
    this.storageManager.validateMockAccess();
    
    try {
      // Используем MockDataProvider как источник истины
      return this.mockDataProvider.getUserData();
    } catch (error) {
      this.logger.error('MockUserManager: Ошибка получения всех пользователей', { error });
      return [];
    }
  }
}

export default MockUserManager;
