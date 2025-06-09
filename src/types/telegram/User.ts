
/**
 * Типы пользователей Telegram
 */

/**
 * Пользователь Telegram (соответствует официальному API)
 */
export interface TelegramUser {
  /** Уникальный идентификатор пользователя */
  id: number;
  /** True, если пользователь - бот */
  is_bot?: boolean;
  /** Имя пользователя */
  first_name: string;
  /** Фамилия пользователя */
  last_name?: string;
  /** Username пользователя */
  username?: string;
  /** Языковой код пользователя */
  language_code?: string;
  /** True, если пользователь имеет Telegram Premium */
  is_premium?: boolean;
  /** True, если пользователь добавил бота в меню вложений */
  added_to_attachment_menu?: boolean;
  /** True, если разрешены личные сообщения с ботом */
  allows_write_to_pm?: boolean;
  /** URL фото профиля пользователя */
  photo_url?: string;
}

/**
 * Фото чата
 */
export interface TelegramChatPhoto {
  /** URL маленького фото (160x160) */
  small_file_id: string;
  /** Уникальный идентификатор маленького фото */
  small_file_unique_id: string;
  /** URL большого фото (640x640) */
  big_file_id: string;
  /** Уникальный идентификатор большого фото */
  big_file_unique_id: string;
}

/**
 * Чат Telegram
 */
export interface TelegramChat {
  /** Уникальный идентификатор чата */
  id: number;
  /** Тип чата: private, group, supergroup, channel */
  type: 'private' | 'group' | 'supergroup' | 'channel';
  /** Заголовок чата (для групп, супергрупп и каналов) */
  title?: string;
  /** Username чата */
  username?: string;
  /** Имя чата (для приватных чатов) */
  first_name?: string;
  /** Фамилия чата (для приватных чатов) */
  last_name?: string;
  /** True, если чат является форумом */
  is_forum?: boolean;
  /** URL фото чата */
  photo?: TelegramChatPhoto;
}

// Экспортируем также для обратной совместимости
export type { TelegramUser as TgUser, TelegramChat as TgChat };
