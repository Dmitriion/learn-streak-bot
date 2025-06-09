
import PaymentProviderManager from './PaymentProviderManager';
import PlansProvider from './PlansProvider';

export interface ServiceHealthDetails {
  healthy: boolean;
  details: {
    availableProviders: number;
    providerStatus: { [key: string]: boolean };
    plansCount: number;
    environment: string;
  };
}

class PaymentHealthService {
  private static instance: PaymentHealthService;
  private providerManager: PaymentProviderManager;
  private plansProvider: PlansProvider;

  constructor() {
    this.providerManager = PaymentProviderManager.getInstance();
    this.plansProvider = PlansProvider.getInstance();
  }

  static getInstance(): PaymentHealthService {
    if (!PaymentHealthService.instance) {
      PaymentHealthService.instance = new PaymentHealthService();
    }
    return PaymentHealthService.instance;
  }

  getServiceHealth(): ServiceHealthDetails {
    const providerStatus = this.providerManager.getProviderStatus();
    const availableProviders = Object.keys(providerStatus).length;
    
    return {
      healthy: availableProviders > 0,
      details: {
        availableProviders,
        providerStatus,
        plansCount: this.plansProvider.getAvailablePlans().length,
        environment: import.meta.env.VITE_APP_ENV || import.meta.env.MODE
      }
    };
  }

  getProviderStatus(): { [key: string]: boolean } {
    return this.providerManager.getProviderStatus();
  }
}

export default PaymentHealthService;
