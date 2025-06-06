
import { TelegramUser, AuthState } from './auth/types';
import { AuthValidator } from './auth/AuthValidator';
import { UserAuthenticator } from './auth/UserAuthenticator';
import { UserRegistrationManager } from './auth/UserRegistrationManager';

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

  async authenticateUser(telegramUser: TelegramUser): Promise<AuthState> {
    return this.authenticator.authenticateUser(telegramUser);
  }

  async registerUser(telegramUser: TelegramUser, fullName: string): Promise<AuthState> {
    return this.registrationManager.registerUser(telegramUser, fullName);
  }
}

export default AuthService;
export type { TelegramUser, AuthState };
