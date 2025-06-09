
/**
 * Типы данных Telegram приложения
 */

import { TelegramUser } from './User';

/**
 * Данные регистрации пользователя
 */
export interface TelegramUserRegistrationData {
  /** ID пользователя */
  user_id: string;
  /** Username */
  username?: string;
  /** Полное имя */
  full_name: string;
  /** Статус курса */
  course_status: 'not_started' | 'in_progress' | 'paused' | 'completed';
  /** Текущий урок */
  current_lesson: number;
  /** Последняя активность */
  last_activity: string;
  /** Баллы */
  score: number;
  /** Данные Telegram */
  telegram_data: TelegramUser;
  /** Статус подписки */
  subscription_status?: 'free' | 'premium' | 'vip';
  /** Дата регистрации */
  registration_date: string;
}

/**
 * Метрики Telegram
 */
export interface TelegramMetrics {
  /** ID пользователя */
  user_id: string;
  /** Telegram ID пользователя */
  telegram_user_id: number;
  /** Версия приложения */
  app_version: string;
  /** Платформа */
  platform: 'ios' | 'android' | 'web';
  /** Тема */
  theme: 'light' | 'dark';
  /** Высота viewport */
  viewport_height: number;
  /** Расширенный режим */
  is_expanded: boolean;
  /** Haptic feedback доступен */
  haptic_feedback_enabled: boolean;
  /** Клики по кнопке назад */
  back_button_clicks: number;
  /** Клики по главной кнопке */
  main_button_clicks: number;
  /** Клики по кнопке настроек */
  settings_button_clicks: number;
}
