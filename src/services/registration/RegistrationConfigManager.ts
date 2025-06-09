
import LoggingService from '../LoggingService';
import { RegistrationServiceConfig } from './types';

export class RegistrationConfigManager {
  private logger: LoggingService;
  private config: RegistrationServiceConfig;

  constructor() {
    this.logger = LoggingService.getInstance();
    this.config = {
      baseWebhookUrl: '',
      useMockMode: true
    };

    this.initializeConfig();
  }

  private initializeConfig() {
    // Проверяем environment переменные через import.meta.env
    const envWebhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || '';
    if (envWebhookUrl) {
      this.setWebhookUrl(envWebhookUrl);
    }
  }

  setWebhookUrl(url: string) {
    this.config.baseWebhookUrl = url;
    this.config.useMockMode = !url || url.length === 0;
    
    this.logger.info('RegistrationConfigManager: Webhook URL установлен', { 
      url: url ? '***configured***' : 'empty',
      useMockMode: this.config.useMockMode 
    });
  }

  getConfig(): RegistrationServiceConfig {
    return { ...this.config };
  }

  isUsingMockMode(): boolean {
    return this.config.useMockMode;
  }

  getWebhookUrl(): string {
    return this.config.baseWebhookUrl;
  }
}
