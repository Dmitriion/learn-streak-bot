
import LoggingService from '../LoggingService';
import EnvironmentManager from '../environment/EnvironmentManager';

export interface AdminDetectionResult {
  isAdmin: boolean;
  hasAdminParam: boolean;
  isDevelopment: boolean;
  shouldShowAdmin: boolean;
  shouldShowDemo: boolean;
}

class AdminDetectionService {
  private static instance: AdminDetectionService;
  private logger: LoggingService;
  private environmentManager: EnvironmentManager;

  constructor() {
    this.logger = LoggingService.getInstance();
    this.environmentManager = EnvironmentManager.getInstance();
  }

  static getInstance(): AdminDetectionService {
    if (!AdminDetectionService.instance) {
      AdminDetectionService.instance = new AdminDetectionService();
    }
    return AdminDetectionService.instance;
  }

  detectAdminAccess(userId?: number): AdminDetectionResult {
    const urlParams = new URLSearchParams(window.location.search);
    const hasAdminParam = urlParams.get('admin') === 'true';
    const isDevelopment = this.environmentManager.isDevelopment();
    
    // Проверяем является ли пользователь настоящим админом
    const adminIds = import.meta.env.VITE_ADMIN_USER_IDS || '';
    const adminUserIds = adminIds
      ? adminIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      : [];
    
    const isRealAdmin = userId ? adminUserIds.includes(userId) : false;
    
    // В development режиме все пользователи могут быть "админами" если есть параметр
    const isAdmin = isDevelopment ? (hasAdminParam || isRealAdmin) : isRealAdmin;
    
    // Определяем что показывать
    const shouldShowAdmin = hasAdminParam && isAdmin;
    const shouldShowDemo = !shouldShowAdmin && !this.isAppFullyConfigured();

    this.logger.info('AdminDetectionService: Результат проверки админского доступа', {
      userId,
      hasAdminParam,
      isDevelopment,
      isRealAdmin,
      isAdmin,
      shouldShowAdmin,
      shouldShowDemo,
      isFullyConfigured: this.isAppFullyConfigured()
    });

    return {
      isAdmin,
      hasAdminParam,
      isDevelopment,
      shouldShowAdmin,
      shouldShowDemo
    };
  }

  private isAppFullyConfigured(): boolean {
    const strategy = this.environmentManager.getStrategy();
    const validation = strategy.validateConfiguration();
    
    if (this.environmentManager.isProduction()) {
      return validation.isValid && validation.errors.length === 0;
    }

    // В development считаем настроенным если есть базовые настройки
    return !!import.meta.env.VITE_N8N_WEBHOOK_URL;
  }

  generateAdminUrl(): string {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('admin', 'true');
    return currentUrl.toString();
  }

  generateDemoUrl(): string {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('admin');
    return currentUrl.toString();
  }

  shouldShowSetupWizard(userId?: number): boolean {
    const detection = this.detectAdminAccess(userId);
    return detection.shouldShowAdmin && !this.isAppFullyConfigured();
  }
}

export default AdminDetectionService;
