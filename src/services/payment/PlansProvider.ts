
import { SubscriptionPlan } from '../../schemas/validation';
import LoggingService from '../LoggingService';

class PlansProvider {
  private static instance: PlansProvider;
  private logger: LoggingService;

  constructor() {
    this.logger = LoggingService.getInstance();
  }

  static getInstance(): PlansProvider {
    if (!PlansProvider.instance) {
      PlansProvider.instance = new PlansProvider();
    }
    return PlansProvider.instance;
  }

  getAvailablePlans(): SubscriptionPlan[] {
    try {
      const plans: SubscriptionPlan[] = [
        {
          id: 'free',
          name: 'Бесплатный',
          price: 0,
          currency: 'RUB',
          duration: 30,
          features: [
            'Доступ к 2 урокам',
            'Базовая аналитика',
            'Сообщество'
          ]
        },
        {
          id: 'premium',
          name: 'Премиум',
          price: 1990,
          currency: 'RUB',
          duration: 30,
          features: [
            'Полный доступ ко всем урокам',
            'Детальная аналитика',
            'Персональные рекомендации',
            'Приоритетная поддержка',
            'Сертификат о прохождении'
          ],
          popular: true
        },
        {
          id: 'vip',
          name: 'VIP',
          price: 4990,
          currency: 'RUB',
          duration: 90,
          features: [
            'Все возможности Премиум',
            'Персональный ментор',
            'Еженедельные групповые сессии',
            'Доступ к закрытому сообществу',
            'Дополнительные материалы',
            'Пожизненные обновления'
          ]
        }
      ];

      this.logger.info('Планы подписки загружены', { plansCount: plans.length });
      return plans;
    } catch (error) {
      this.logger.error('Ошибка загрузки планов подписки', { error });
      return [];
    }
  }

  getPlanById(planId: string): SubscriptionPlan | null {
    const plans = this.getAvailablePlans();
    return plans.find(plan => plan.id === planId) || null;
  }

  getAvailableProviders(): string[] {
    // Определяем доступные провайдеры на основе конфигурации
    const providers: string[] = [];
    
    // Проверяем YOUKassa
    if (import.meta.env.VITE_YOUKASSA_SHOP_ID && import.meta.env.VITE_YOUKASSA_SECRET_KEY) {
      providers.push('youkassa');
    }
    
    // Проверяем Robocasa
    if (import.meta.env.VITE_ROBOCASA_MERCHANT_ID && import.meta.env.VITE_ROBOCASA_SECRET_KEY) {
      providers.push('robocasa');
    }
    
    // Telegram платежи доступны если есть N8N webhook
    const n8nWebhookUrl = localStorage.getItem('n8n_webhook_url');
    if (n8nWebhookUrl) {
      providers.push('telegram');
    }
    
    this.logger.info('Доступные провайдеры платежей', { providers });
    return providers;
  }

  getRecommendedProvider(): string {
    const providers = this.getAvailableProviders();
    
    // Приоритет: Telegram > YOUKassa > Robocasa
    if (providers.includes('telegram')) {
      return 'telegram';
    } else if (providers.includes('youkassa')) {
      return 'youkassa';
    } else if (providers.includes('robocasa')) {
      return 'robocasa';
    }
    
    return providers[0] || 'youkassa';
  }
}

export default PlansProvider;
