
import { TelegramUser, AuthState, UserRegistrationData } from './types';
import { AuthValidator } from './AuthValidator';
import UserRegistrationService from '../UserRegistrationService';
import ErrorService from '../ErrorService';
import LoggingService from '../LoggingService';

export class UserRegistrationManager {
  private validator: AuthValidator;
  private registrationService: UserRegistrationService;
  private errorService: ErrorService;
  private logger: LoggingService;

  constructor() {
    this.validator = new AuthValidator();
    this.registrationService = UserRegistrationService.getInstance();
    this.errorService = ErrorService.getInstance();
    this.logger = LoggingService.getInstance();
  }

  async registerUser(telegramUser: TelegramUser, fullName: string): Promise<AuthState> {
    this.logger.info('Начало регистрации пользователя', { 
      userId: telegramUser.id,
      fullNameLength: fullName.length 
    });
    
    try {
      const userData: UserRegistrationData = {
        user_id: telegramUser.id.toString(),
        username: telegramUser.username,
        full_name: fullName.trim(),
        course_status: 'not_started',
        current_lesson: 0,
        last_activity: new Date().toISOString(),
        score: 0,
        telegram_data: telegramUser
      };

      // Валидация данных регистрации
      const validation = this.validator.validateRegistrationData(userData);
      if (!validation.isValid) {
        return {
          isAuthenticated: true,
          isRegistered: false,
          user: telegramUser,
          registrationStatus: 'error',
          error: validation.error
        };
      }

      // Регистрация с retry механизмом
      const result = await this.errorService.withRetry(
        () => this.registrationService.registerUser(userData),
        3,
        1000,
        'network'
      );
      
      if (result.success) {
        this.logger.info('Пользователь успешно зарегистрирован', { userId: telegramUser.id });
        
        return {
          isAuthenticated: true,
          isRegistered: true,
          user: telegramUser,
          registrationStatus: 'success'
        };
      } else {
        const error = this.errorService.handleError({
          category: 'auth',
          message: `Ошибка регистрации: ${result.message}`,
          context: { userId: telegramUser.id },
          recoverable: true
        });

        return {
          isAuthenticated: true,
          isRegistered: false,
          user: telegramUser,
          registrationStatus: 'error',
          error: result.message
        };
      }
    } catch (error) {
      const appError = this.errorService.handleError({
        category: 'auth',
        message: 'Критическая ошибка при регистрации',
        originalError: error as Error,
        context: { userId: telegramUser.id },
        recoverable: true
      });

      return {
        isAuthenticated: true,
        isRegistered: false,
        user: telegramUser,
        registrationStatus: 'error',
        error: 'Ошибка при регистрации'
      };
    }
  }
}
