
import { SubscriptionPlan } from '../../schemas/validation';

class PlansProvider {
  private static instance: PlansProvider;

  static getInstance(): PlansProvider {
    if (!PlansProvider.instance) {
      PlansProvider.instance = new PlansProvider();
    }
    return PlansProvider.instance;
  }

  getAvailablePlans(): SubscriptionPlan[] {
    return [
      {
        id: 'basic',
        name: 'Базовый доступ',
        price: 0,
        currency: 'RUB',
        duration: 30,
        features: ['Доступ к первым 3 урокам', 'Базовая аналитика']
      },
      {
        id: 'premium',
        name: 'Премиум доступ',
        price: 1990,
        currency: 'RUB',
        duration: 30,
        features: ['Все уроки курса', 'Детальная аналитика', 'Сертификат'],
        popular: true
      },
      {
        id: 'vip',
        name: 'VIP доступ',
        price: 4990,
        currency: 'RUB',
        duration: 30,
        features: ['Все уроки курса', 'Персональные консультации', 'Приоритетная поддержка', 'Дополнительные материалы']
      }
    ];
  }
}

export default PlansProvider;
