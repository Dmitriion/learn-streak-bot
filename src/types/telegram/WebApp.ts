
/**
 * Типы Telegram WebApp API
 */

/**
 * Данные инициализации Telegram WebApp
 */
export interface TelegramInitData {
  /** Объект пользователя */
  user?: import('./User').TelegramUser;
  /** Объект получателя (для ботов в режиме inline) */
  receiver?: import('./User').TelegramUser;
  /** Объект чата */
  chat?: import('./User').TelegramChat;
  /** Тип чата, из которого открыт WebApp */
  chat_type?: 'private' | 'group' | 'supergroup' | 'channel';
  /** Глобальный идентификатор чата */
  chat_instance?: string;
  /** Время авторизации в Unix timestamp */
  auth_date: number;
  /** Хеш для проверки подлинности данных */
  hash: string;
  /** Параметр запуска */
  start_param?: string;
  /** Признак возможности отправки сообщений */
  can_send_after?: number;
}

/**
 * Данные темы Telegram
 */
export interface TelegramThemeParams {
  /** Цвет фона */
  bg_color?: string;
  /** Цвет текста */
  text_color?: string;
  /** Цвет подсказки */
  hint_color?: string;
  /** Цвет ссылки */
  link_color?: string;
  /** Цвет кнопки */
  button_color?: string;
  /** Цвет текста кнопки */
  button_text_color?: string;
  /** Цвет вторичного фона */
  secondary_bg_color?: string;
  /** Цвет заголовка */
  header_bg_color?: string;
  /** Цвет разделителя */
  accent_text_color?: string;
  /** Цвет разделителя */
  section_bg_color?: string;
  /** Цвет разделителя */
  section_header_text_color?: string;
  /** Цвет подзаголовка */
  subtitle_text_color?: string;
  /** Цвет деструктивного текста */
  destructive_text_color?: string;
}

/**
 * Размеры viewport
 */
export interface TelegramViewport {
  /** Высота viewport */
  height: number;
  /** Стабильная высота viewport */
  stable_height: number;
  /** Признак расширения */
  is_expanded: boolean;
  /** Признак состояния fullscreen */
  is_state_stable: boolean;
}

/**
 * Главная кнопка
 */
export interface TelegramMainButton {
  /** Текст кнопки */
  text: string;
  /** Цвет кнопки */
  color?: string;
  /** Цвет текста */
  textColor?: string;
  /** Видимость кнопки */
  isVisible: boolean;
  /** Активность кнопки */
  isActive: boolean;
  /** Состояние загрузки */
  isProgressVisible: boolean;
}

/**
 * Кнопка назад
 */
export interface TelegramBackButton {
  /** Видимость кнопки */
  isVisible: boolean;
}

/**
 * Настройки кнопки
 */
export interface TelegramSettingsButton {
  /** Видимость кнопки */
  isVisible: boolean;
}

// Экспортируем также для обратной совместимости
export type { TelegramInitData as TgInitData };
