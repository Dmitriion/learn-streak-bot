
import { TelegramUser, AuthState, UserRegistrationData } from './types';
import { AuthValidator } from './AuthValidator';
import UserRegistrationService from '../UserRegistrationService';
import AutomationManager from '../automation/AutomationManager';
import ErrorService from '../ErrorService';
import LoggingService from '../LoggingService';

export class UserRegistrationManager {
  private validator: AuthValidator;
  private registrationService: UserRegistrationService;
  private automationManager: AutomationManager;
  private errorService: ErrorService;
  private logger: LoggingService;

  constructor() {
    this.validator = new AuthValidator();
    this.registrationService = UserRegistrationService.getInstance();
    this.automationManager = AutomationManager.getInstance();
    this.errorService = ErrorService.getInstance();
    this.logger = LoggingService.getInstance();
  }

  async registerUser(telegramUser: TelegramUser, fullName: string): Promise<AuthState> {
    this.logger.info('Начало регистрации пользователя', { userId: telegramUser.id, fullName });
    
    try {
      // Валидация данных пользователя
      const validation = this.validator.validateTelegramUserData(telegramUser);
      if (!validation.isValid) {
        return {
          isAuthenticated: false,
          isRegistered: false,
          user: null,
          registrationStatus: 'error',
          error: validation.error
        };
      }

      // Подготовка данных для регистрации
      const registrationData: UserRegistrationData = {
        user_id: telegramUser.id.toString(),
        username: telegramUser.username,
        full_name: fullName,
        course_status: 'not_started',
        current_lesson: 0,
        last_activity: new Date().toISOString(),
        score: 0,
        telegram_data: telegramUser
      };

      // Валидация данных регистрации
      const dataValidation = this.validator.validateRegistrationData(registrationData);
      if (!dataValidation.isValid) {
        return {
          isAuthenticated: false,
          isRegistered: false,
          user: null,
          registrationStatus: 'error',
          error: dataValidation.error
        };
      }

      // Регистрация пользователя в системе
      const registrationResult = await this.registrationService.registerUser(registrationData);
      
      if (!registrationResult.success) {
        return {
          isAuthenticated: false,
          isRegistered: false,
          user: null,
          registrationStatus: 'error',
          error: registrationResult.message || 'Ошибка регистрации'
        };
      }

      // Триггер автоматизации для новой регистрации
      await this.automationManager.onUserRegistered(telegramUser, fullName);

      this.logger.info('Пользователь успешно зарегистрирован', { userId: telegramUser.id });

      return {
        isAuthenticated: true,
        isRegistered: true,
        user: telegramUser,
        registrationStatus: 'success'
      };
    } catch (error) {
      const appError = this.errorService.handleError({
        category: 'auth',
        message: 'Ошибка регистрации пользователя',
        originalError: error as Error,
        context: { userId: telegramUser.id, fullName },
        recoverable: true
      });

      return {
        isAuthenticated: false,
        isRegistered: false,
        user: null,
        registrationStatus: 'error',
        error: 'Ошибка при регистрации пользователя'
      };
    }
  }
}
