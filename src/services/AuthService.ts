
import UserRegistrationService, { UserRegistrationData } from './UserRegistrationService';

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

  constructor() {
    this.registrationService = UserRegistrationService.getInstance();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  validateInitData(initData: string): boolean {
    // Базовая валидация initData от Telegram
    // В реальном приложении здесь должна быть проверка hash
    return initData && initData.length > 0;
  }

  async authenticateUser(telegramUser: TelegramUser): Promise<AuthState> {
    try {
      const userId = telegramUser.id.toString();
      
      // Проверяем существует ли пользователь
      const checkResult = await this.registrationService.checkUserExists(userId);
      
      if (checkResult.success && checkResult.user_exists) {
        // Пользователь уже зарегистрирован
        await this.registrationService.updateUserActivity(userId);
        
        return {
          isAuthenticated: true,
          isRegistered: true,
          user: telegramUser,
          registrationStatus: 'success'
        };
      } else {
        // Пользователь не зарегистрирован
        return {
          isAuthenticated: true,
          isRegistered: false,
          user: telegramUser,
          registrationStatus: 'idle'
        };
      }
    } catch (error) {
      console.error('Ошибка аутентификации:', error);
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
    try {
      const userData: UserRegistrationData = {
        user_id: telegramUser.id.toString(),
        username: telegramUser.username,
        full_name: fullName,
        course_status: 'not_started',
        current_lesson: 0,
        last_activity: new Date().toISOString(),
        score: 0,
        telegram_data: telegramUser
      };

      const result = await this.registrationService.registerUser(userData);
      
      if (result.success) {
        return {
          isAuthenticated: true,
          isRegistered: true,
          user: telegramUser,
          registrationStatus: 'success'
        };
      } else {
        return {
          isAuthenticated: true,
          isRegistered: false,
          user: telegramUser,
          registrationStatus: 'error',
          error: result.message
        };
      }
    } catch (error) {
      console.error('Ошибка регистрации:', error);
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
