
import UserRegistrationService from '../UserRegistrationService';
import AutomationManager from '../automation/AutomationManager';
import LoggingService from '../LoggingService';
import { TelegramUser, TelegramAuthState, TelegramUserRegistrationData } from '../../types/TelegramTypes';

export class UserRegistrationManager {
  private registrationService: UserRegistrationService;
  private automationManager: AutomationManager;
  private logger: LoggingService;

  constructor() {
    this.registrationService = UserRegistrationService.getInstance();
    this.automationManager = AutomationManager.getInstance();
    this.logger = LoggingService.getInstance();
  }

  async registerUser(telegramUser: TelegramUser, fullName: string): Promise<TelegramAuthState> {
    this.logger.info('Начало регистрации пользователя', { userId: telegramUser.id });
    
    try {
      const registrationData: TelegramUserRegistrationData = {
        user_id: telegramUser.id.toString(),
        username: telegramUser.username || '',
        full_name: fullName,
        course_status: 'not_started',
        current_lesson: 0,
        last_activity: new Date().toISOString(),
        score: 0,
        telegram_data: telegramUser,
        registration_date: new Date().toISOString()
      };

      const success = await this.registrationService.registerUser(registrationData);
      
      if (success) {
        // Отправляем событие автоматизации
        await this.automationManager.sendEvent('user_registered', {
          user_id: telegramUser.id.toString(),
          username: telegramUser.username || '',
          full_name: fullName,
          registration_date: new Date().toISOString()
        });

        this.logger.info('Пользователь успешно зарегистрирован', { userId: telegramUser.id });
        
        return {
          isAuthenticated: true,
          isRegistered: true,
          user: telegramUser,
          registrationStatus: 'success'
        };
      } else {
        throw new Error('Ошибка при сохранении данных регистрации');
      }
    } catch (error) {
      this.logger.error('Ошибка регистрации пользователя:', error);
      
      return {
        isAuthenticated: true,
        isRegistered: false,
        user: telegramUser,
        registrationStatus: 'error',
        error: 'Не удалось завершить регистрацию'
      };
    }
  }
}
