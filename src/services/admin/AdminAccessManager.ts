
import LoggingService from '../LoggingService';
import EnvironmentManager from '../environment/EnvironmentManager';

export interface AdminAccessConfig {
  adminUserIds: number[];
  requireAdminParam: boolean;
  devModeAccess: boolean;
}

class AdminAccessManager {
  private static instance: AdminAccessManager;
  private logger: LoggingService;
  private environmentManager: EnvironmentManager;
  private config: AdminAccessConfig;

  constructor() {
    this.logger = LoggingService.getInstance();
    this.environmentManager = EnvironmentManager.getInstance();
    this.config = this.initializeConfig();
  }

  static getInstance(): AdminAccessManager {
    if (!AdminAccessManager.instance) {
      AdminAccessManager.instance = new AdminAccessManager();
    }
    return AdminAccessManager.instance;
  }

  private initializeConfig(): AdminAccessConfig {
    // Читаем список админских ID из environment переменных
    const adminIds = import.meta.env.VITE_ADMIN_USER_IDS || '';
    const adminUserIds = adminIds
      ? adminIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      : [];

    return {
      adminUserIds,
      requireAdminParam: import.meta.env.VITE_REQUIRE_ADMIN_PARAM === 'true',
      devModeAccess: this.environmentManager.isDevelopment()
    };
  }

  isUserAdmin(userId?: number): boolean {
    if (!userId) return false;

    // В development режиме все пользователи могут быть админами
    if (this.config.devModeAccess && this.environmentManager.isDevelopment()) {
      return true;
    }

    // Проверяем ID пользователя в списке админов
    return this.config.adminUserIds.includes(userId);
  }

  hasAdminAccess(userId?: number): boolean {
    // Проверяем URL параметр admin=true
    const urlParams = new URLSearchParams(window.location.search);
    const hasAdminParam = urlParams.get('admin') === 'true';

    // Если требуется параметр admin, проверяем его наличие
    if (this.config.requireAdminParam && !hasAdminParam) {
      return false;
    }

    // Если есть параметр admin, проверяем является ли пользователь админом
    if (hasAdminParam) {
      return this.isUserAdmin(userId);
    }

    // В остальных случаях доступ только для настоящих админов
    return this.isUserAdmin(userId);
  }

  shouldShowSetupWizard(userId?: number): boolean {
    // Показываем мастер только если:
    // 1. Пользователь имеет админский доступ
    // 2. Приложение не полностью настроено
    return this.hasAdminAccess(userId) && !this.isAppFullyConfigured();
  }

  private isAppFullyConfigured(): boolean {
    const strategy = this.environmentManager.getStrategy();
    const validation = strategy.validateConfiguration();
    
    // В production все должно быть настроено
    if (this.environmentManager.isProduction()) {
      return validation.isValid && validation.errors.length === 0;
    }

    // В development считаем настроенным если есть базовые настройки
    return !!import.meta.env.VITE_N8N_WEBHOOK_URL;
  }

  getAdminConfig(): AdminAccessConfig {
    return { ...this.config };
  }

  logAdminAccess(userId?: number, action: string = 'access') {
    this.logger.info('AdminAccessManager: Попытка админского доступа', {
      userId,
      action,
      hasAccess: this.hasAdminAccess(userId),
      isFullyConfigured: this.isAppFullyConfigured()
    });
  }
}

export default AdminAccessManager;
