
import LoggingService from '../LoggingService';

class TelegramHapticService {
  private static instance: TelegramHapticService;
  private logger: LoggingService;

  constructor() {
    this.logger = LoggingService.getInstance();
  }

  static getInstance(): TelegramHapticService {
    if (!TelegramHapticService.instance) {
      TelegramHapticService.instance = new TelegramHapticService();
    }
    return TelegramHapticService.instance;
  }

  triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' | 'error' | 'success' | 'warning'): void {
    if (!window.Telegram?.WebApp?.HapticFeedback) {
      this.logger.debug('Haptic feedback недоступен');
      return;
    }

    try {
      const hapticFeedback = window.Telegram.WebApp.HapticFeedback;
      
      switch (type) {
        case 'light':
        case 'medium':
        case 'heavy':
          hapticFeedback.impactOccurred(type);
          break;
        case 'error':
        case 'success':
        case 'warning':
          hapticFeedback.notificationOccurred(type);
          break;
      }
      
      this.logger.debug('Haptic feedback triggered', { type });
    } catch (error) {
      this.logger.error('Ошибка haptic feedback', { error, type });
    }
  }

  isHapticAvailable(): boolean {
    return !!window.Telegram?.WebApp?.HapticFeedback;
  }
}

export default TelegramHapticService;
