
import LoggingService from './LoggingService';
import { AuthValidator } from './auth/AuthValidator';
import { UserAuthenticator } from './auth/UserAuthenticator';
import UserRegistrationManager from './auth/UserRegistrationManager';
import { TelegramUser, TelegramAuthState } from '../types/TelegramTypes';

class AuthService {
  private static instance: AuthService;
  private validator: AuthValidator;
  private authenticator: UserAuthenticator;
  private registrationManager: UserRegistrationManager;

  constructor() {
    this.validator = new AuthValidator();
    this.authenticator = new UserAuthenticator();
    this.registrationManager = new UserRegistrationManager();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  validateInitData(initData: string): boolean {
    return this.validator.validateInitData(initData);
  }

  async authenticateUser(telegramUser: TelegramUser): Promise<TelegramAuthState> {
    return this.authenticator.authenticateUser(telegramUser);
  }

  async registerUser(telegramUser: TelegramUser, fullName: string): Promise<TelegramAuthState> {
    try {
      const registrationData = await this.registrationManager.registerUser(telegramUser, fullName);
      
      return {
        isAuthenticated: true,
        isRegistered: true,
        user: telegramUser,
        registrationStatus: 'success'
      };
    } catch (error) {
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
export type { TelegramUser, TelegramAuthState };
