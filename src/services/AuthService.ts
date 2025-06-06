
import UserRegistrationService, { UserRegistrationData } from './UserRegistrationService';
import TelegramValidationService from './TelegramValidationService';
import ErrorService from './ErrorService';
import LoggingService from './LoggingService';
import { validateTelegramUser, validateUserRegistration } from '../schemas/validation';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isRegistered: boolean;
  user: TelegramUser | null;
  registrationStatus: 'idle' | 'checking' | 'registering' | 'success' | 'error';
  error?: string;
}

class AuthService {
  private static instance: AuthService;
  private registrationService: UserRegistrationService;
  private validationService: TelegramValidationService;
  private errorService: ErrorService;
  private logger: LoggingService;

  constructor() {
    this.registrationService = UserRegistrationService.getInstance();
    this.validationService = TelegramValidationService.getInstance();
    this.errorService = ErrorService.getInstance();
    this.logger = LoggingService.getInstance();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  validateInitData(initData: string): boolean {
    this.logger.debug('Валидация initData', { dataLength: initData?.length });
    
    const validationResult = this.validationService.validateInitData(initData);
    
    if (!validationResult.isValid) {
      this.errorService.handleTelegramError(
        `Невалидные initData: ${validationResult.error}`,
        { initDataLength: initData?.length }
      );
      return false;
    }

    this.logger.info('InitData успешно валидированы');
    return true;
  }

  async authenticateUser(telegramUser: TelegramUser): Promise<AuthState> {
    this.logger.info('Начало аутентификации пользователя', { userId: telegramUser.id });
    
    try {
      // Валидация данных пользователя
      const userValidation = validateTelegramUser(telegramUser);
      if (!userValidation.success) {
        const error = this.errorService.handleValidationError(
          'Невалидные данные пользователя Telegram',
          { validationErrors: userValidation.error.issues }
        );
        
        return {
          isAuthenticated: false,
          isRegistered: false,
          user: null,
          registrationStatus: 'error',
          error: 'Невалидные данные пользователя'
        };
      }

      // Дополнительная проверка безопасности
      const userDataValidation = this.validationService.validateUserData(telegramUser);
      if (!userDataValidation.isValid) {
        this.logger.warn('Обнаружены подозрительные данные пользователя', {
          userId: telegramUser.id,
          warnings: userDataValidation.warnings
        });
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
      const validationResult = validateUserRegistration(userData);
      if (!validationResult.success) {
        const error = this.errorService.handleValidationError(
          'Невалидные данные для регистрации',
          { validationErrors: validationResult.error.issues }
        );
        
        return {
          isAuthenticated: true,
          isRegistered: false,
          user: telegramUser,
          registrationStatus: 'error',
          error: 'Невалидные данные для регистрации'
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

export default AuthService;
