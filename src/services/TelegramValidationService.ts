
import LoggingService from './LoggingService';
import SecurityValidationService from './validation/SecurityValidationService';
import ContentValidationService from './validation/ContentValidationService';
import InitDataValidator from './validation/InitDataValidator';
import EnvironmentValidator from './validation/EnvironmentValidator';
import { 
  TelegramUser, 
  TelegramInitDataValidationResult, 
  TelegramUserValidationResult, 
  TelegramValidationResult 
} from '../types/TelegramTypes';

class TelegramValidationService {
  private static instance: TelegramValidationService;
  private logger: LoggingService;
  private securityService: SecurityValidationService;
  private contentService: ContentValidationService;
  private initDataValidator: InitDataValidator;
  private environmentValidator: EnvironmentValidator;

  constructor() {
    this.logger = LoggingService.getInstance();
    this.securityService = SecurityValidationService.getInstance();
    this.contentService = ContentValidationService.getInstance();
    this.initDataValidator = InitDataValidator.getInstance();
    this.environmentValidator = EnvironmentValidator.getInstance();
  }

  static getInstance(): TelegramValidationService {
    if (!TelegramValidationService.instance) {
      TelegramValidationService.instance = new TelegramValidationService();
    }
    return TelegramValidationService.instance;
  }

  validateInitData(initData: string): TelegramInitDataValidationResult {
    return this.initDataValidator.validateInitData(initData);
  }

  validateUserData(telegramUser: TelegramUser): TelegramUserValidationResult {
    return this.contentService.validateUserData(telegramUser);
  }

  validateWebhookUrl(url: string): TelegramValidationResult {
    return this.securityService.validateWebhookUrl(url);
  }

  validateNonce(nonce: string): boolean {
    return this.securityService.validateNonce(nonce);
  }

  getEnvironmentInfo() {
    return this.environmentValidator.getEnvironmentInfo();
  }

  validateEnvironment() {
    return this.environmentValidator.validateEnvironment();
  }
}

export default TelegramValidationService;
