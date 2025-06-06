
import { validateTelegramUser, validateUserRegistration } from '../../schemas/validation';
import { TelegramUser, UserRegistrationData } from './types';
import TelegramValidationService from '../TelegramValidationService';
import ErrorService from '../ErrorService';
import LoggingService from '../LoggingService';

export class AuthValidator {
  private validationService: TelegramValidationService;
  private errorService: ErrorService;
  private logger: LoggingService;

  constructor() {
    this.validationService = TelegramValidationService.getInstance();
    this.errorService = ErrorService.getInstance();
    this.logger = LoggingService.getInstance();
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

  validateTelegramUserData(telegramUser: TelegramUser): { isValid: boolean; error?: string } {
    const userValidation = validateTelegramUser(telegramUser);
    if (!userValidation.success) {
      const error = this.errorService.handleValidationError(
        'Невалидные данные пользователя Telegram',
        { validationErrors: userValidation.error.issues }
      );
      
      return {
        isValid: false,
        error: 'Невалидные данные пользователя'
      };
    }

    const userDataValidation = this.validationService.validateUserData(telegramUser);
    if (!userDataValidation.isValid) {
      this.logger.warn('Обнаружены подозрительные данные пользователя', {
        userId: telegramUser.id,
        warnings: userDataValidation.warnings
      });
    }

    return { isValid: true };
  }

  validateRegistrationData(userData: UserRegistrationData): { isValid: boolean; error?: string } {
    const validationResult = validateUserRegistration(userData);
    if (!validationResult.success) {
      const error = this.errorService.handleValidationError(
        'Невалидные данные для регистрации',
        { validationErrors: validationResult.error.issues }
      );
      
      return {
        isValid: false,
        error: 'Невалидные данные для регистрации'
      };
    }

    return { isValid: true };
  }
}
