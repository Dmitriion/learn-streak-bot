
import LoggingService from '../LoggingService';
import { ServiceHealth } from '../environment/types';

type HealthCheckFunction = () => Promise<{ healthy: boolean; responseTime?: number; error?: string }>;

class HealthCheckService {
  private static instance: HealthCheckService;
  private services = new Map<string, HealthCheckFunction>();
  private healthStatus = new Map<string, ServiceHealth>();
  private logger: LoggingService;
  private checkInterval: number | null = null;

  constructor() {
    this.logger = LoggingService.getInstance();
  }

  static getInstance(): HealthCheckService {
    if (!HealthCheckService.instance) {
      HealthCheckService.instance = new HealthCheckService();
    }
    return HealthCheckService.instance;
  }

  registerService(name: string, healthCheck: HealthCheckFunction) {
    this.services.set(name, healthCheck);
    this.healthStatus.set(name, {
      name,
      status: 'healthy',
      lastCheck: new Date().toISOString(),
      errorCount: 0
    });

    this.logger.debug(`HealthCheck: сервис ${name} зарегистрирован`);
  }

  async checkService(serviceName: string): Promise<ServiceHealth> {
    const healthCheck = this.services.get(serviceName);
    if (!healthCheck) {
      throw new Error(`Сервис ${serviceName} не зарегистрирован`);
    }

    const currentStatus = this.healthStatus.get(serviceName)!;
    const startTime = Date.now();

    try {
      const result = await healthCheck();
      const responseTime = Date.now() - startTime;

      const newStatus: ServiceHealth = {
        ...currentStatus,
        status: result.healthy ? 'healthy' : 'degraded',
        lastCheck: new Date().toISOString(),
        responseTime: result.responseTime || responseTime,
        errorCount: result.healthy ? 0 : currentStatus.errorCount + 1
      };

      this.healthStatus.set(serviceName, newStatus);
      return newStatus;
    } catch (error) {
      const newStatus: ServiceHealth = {
        ...currentStatus,
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        errorCount: currentStatus.errorCount + 1
      };

      this.healthStatus.set(serviceName, newStatus);
      this.logger.error(`HealthCheck: сервис ${serviceName} недоступен`, { error });
      return newStatus;
    }
  }

  async checkAllServices(): Promise<Map<string, ServiceHealth>> {
    const results = new Map<string, ServiceHealth>();

    for (const serviceName of this.services.keys()) {
      try {
        const status = await this.checkService(serviceName);
        results.set(serviceName, status);
      } catch (error) {
        this.logger.error(`HealthCheck: ошибка проверки ${serviceName}`, { error });
      }
    }

    return results;
  }

  getServiceHealth(serviceName: string): ServiceHealth | null {
    return this.healthStatus.get(serviceName) || null;
  }

  getAllHealthStatus(): Map<string, ServiceHealth> {
    return new Map(this.healthStatus);
  }

  startPeriodicChecks(intervalMs: number = 60000) {
    if (this.checkInterval !== null) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = window.setInterval(async () => {
      await this.checkAllServices();
    }, intervalMs);

    this.logger.info(`HealthCheck: периодические проверки запущены (${intervalMs}ms)`);
  }

  stopPeriodicChecks() {
    if (this.checkInterval !== null) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      this.logger.info('HealthCheck: периодические проверки остановлены');
    }
  }

  getOverallHealth(): 'healthy' | 'degraded' | 'unhealthy' {
    const statuses = Array.from(this.healthStatus.values());
    
    if (statuses.length === 0) return 'healthy';
    
    const unhealthyCount = statuses.filter(s => s.status === 'unhealthy').length;
    const degradedCount = statuses.filter(s => s.status === 'degraded').length;
    
    if (unhealthyCount > 0) return 'unhealthy';
    if (degradedCount > 0) return 'degraded';
    return 'healthy';
  }
}

export default HealthCheckService;
