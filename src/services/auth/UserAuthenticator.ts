
import { TelegramUser, TelegramAuthState } from '../../types/TelegramTypes';
import { AuthValidator } from './AuthValidator';
import UserRegistrationService from '../UserRegistrationService';
import ErrorService from '../ErrorService';
import LoggingService from '../LoggingService';

export class UserAuthenticator {
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

  async authenticateUser(telegramUser: TelegramUser): Promise<TelegramAuthState> {
    this.logger.info('Начало аутентификации пользователя', { userId: telegramUser.id });
    
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

      const userId = telegramUser.id.toString();
      this.logger.setUserId(userId);
      
      // Проверяем существует ли пользователь с retry механизмом
      const checkResult = await this.errorService.withRetry(
        () => this.registrationService.checkUserExists(userId),
        3,
        1000,
        'network'
      );
      
      if (checkResult.success && checkResult.user_exists) {
        // Пользователь уже зарегистрирован
        await this.registrationService.updateUserActivity(userId);
        
        this.logger.info('Пользователь успешно аутентифицирован', { userId });
        
        return {
          isAuthenticated: true,
          isRegistered: true,
          user: telegramUser,
          registrationStatus: 'success'
        };
      } else {
        // Пользователь не зарегистрирован
        this.logger.info('Пользователь не зарегистрирован', { userId });
        
        return {
          isAuthenticated: true,
          isRegistered: false,
          user: telegramUser,
          registrationStatus: 'idle'
        };
      }
    } catch (error) {
      const appError = this.errorService.handleError({
        category: 'auth',
        message: 'Ошибка аутентификации пользователя',
        originalError: error as Error,
        context: { userId: telegramUser.id },
        recoverable: true
      });

      return {
        isAuthenticated: false,
        isRegistered: false,
        user: null,
        registrationStatus: 'error',
        error: 'Ошибка при проверке пользователя'
      };
    }
  }
}
