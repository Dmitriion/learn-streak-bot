
import { TelegramUser, TelegramUserRegistrationData } from '../../types/TelegramTypes';
import AutomationManager from '../automation/AutomationManager';
import MockBackendService from '../mock/MockBackendService';
import LoggingService from '../LoggingService';

class UserRegistrationManager {
  private static instance: UserRegistrationManager;
  private logger: LoggingService;
  private mockBackend: MockBackendService;
  private automationManager: AutomationManager;

  constructor() {
    this.logger = LoggingService.getInstance();
    this.mockBackend = MockBackendService.getInstance();
    this.automationManager = AutomationManager.getInstance();
  }

  static getInstance(): UserRegistrationManager {
    if (!UserRegistrationManager.instance) {
      UserRegistrationManager.instance = new UserRegistrationManager();
    }
    return UserRegistrationManager.instance;
  }

  async registerUser(telegramUser: TelegramUser, fullName: string): Promise<TelegramUserRegistrationData> {
    const registrationData: TelegramUserRegistrationData = {
      user_id: telegramUser.id.toString(),
      username: telegramUser.username,
      full_name: fullName,
      course_status: 'not_started',
      current_lesson: 0,
      last_activity: new Date().toISOString(),
      score: 0,
      telegram_data: telegramUser,
      subscription_status: 'free',
      registration_date: new Date().toISOString()
    };

    try {
      // Сохраняем в mock backend с правильной сигнатурой
      await this.mockBackend.registerUser(registrationData);
      
      // Отправляем событие автоматизации используя правильный метод
      await this.automationManager.onUserRegistered(telegramUser, fullName);

      this.logger.info('Пользователь зарегистрирован', { userId: telegramUser.id });
      return registrationData;
    } catch (error) {
      this.logger.error('Ошибка регистрации пользователя', { error, userId: telegramUser.id });
      throw error;
    }
  }

  async checkUserExists(userId: string): Promise<boolean> {
    try {
      const result = await this.mockBackend.checkUserExists(userId);
      return result.user_exists || false;
    } catch (error) {
      this.logger.error('Ошибка проверки пользователя', { error, userId });
      return false;
    }
  }

  async updateUserActivity(userId: string): Promise<void> {
    try {
      await this.mockBackend.updateUserActivity(userId);
      this.logger.debug('Активность пользователя обновлена', { userId });
    } catch (error) {
      this.logger.error('Ошибка обновления активности', { error, userId });
    }
  }
}

export default UserRegistrationManager;
