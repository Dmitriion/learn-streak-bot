
/**
 * Унифицированные типы для Telegram API
 * Соответствуют официальному Telegram Bot API и WebApp API
 */

// ==================== ОСНОВНЫЕ ТИПЫ TELEGRAM API ====================

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

// ==================== TELEGRAM WEBAPP API ====================

/**
 * Данные инициализации Telegram WebApp
 */
export interface TelegramInitData {
  /** Объект пользователя */
  user?: TelegramUser;
  /** Объект получателя (для ботов в режиме inline) */
  receiver?: TelegramUser;
  /** Объект чата */
  chat?: TelegramChat;
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

// ==================== TELEGRAM WEBAPP КОМПОНЕНТЫ ====================

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

// ==================== СОБЫТИЯ И ХУКИ ====================

/**
 * Типы событий Telegram WebApp
 */
export type TelegramEventType = 
  | 'themeChanged'
  | 'viewportChanged'
  | 'mainButtonClicked'
  | 'backButtonClicked'
  | 'settingsButtonClicked'
  | 'invoiceClosed'
  | 'popupClosed'
  | 'qrTextReceived'
  | 'clipboardTextReceived'
  | 'writeAccessRequested'
  | 'contactRequested';

/**
 * Параметры haptic feedback
 */
export type TelegramHapticFeedbackType = 'light' | 'medium' | 'heavy';
export type TelegramNotificationFeedbackType = 'error' | 'success' | 'warning';

/**
 * Статус платежа
 */
export type TelegramPaymentStatus = 'paid' | 'cancelled' | 'failed' | 'pending';

// ==================== СОСТОЯНИЯ И КОНТЕКСТЫ ====================

/**
 * Состояние аутентификации
 */
export interface TelegramAuthState {
  /** Пользователь аутентифицирован */
  isAuthenticated: boolean;
  /** Пользователь зарегистрирован */
  isRegistered: boolean;
  /** Данные пользователя */
  user: TelegramUser | null;
  /** Статус регистрации */
  registrationStatus: 'idle' | 'checking' | 'registering' | 'success' | 'error';
  /** Ошибка */
  error?: string;
}

/**
 * Состояние WebApp
 */
export interface TelegramWebAppState {
  /** WebApp готов */
  isReady: boolean;
  /** WebApp инициализирован */
  isInitialized: boolean;
  /** Высота viewport */
  viewportHeight: number;
  /** WebApp расширен */
  isExpanded: boolean;
  /** Текущая тема */
  theme: 'light' | 'dark';
  /** Параметры темы */
  themeParams: TelegramThemeParams;
  /** Включено подтверждение закрытия */
  isClosingConfirmationEnabled: boolean;
  /** Платформа */
  platform: string;
  /** Версия */
  version: string;
}

// ==================== ДАННЫЕ ПРИЛОЖЕНИЯ ====================

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

// ==================== РЕЗУЛЬТАТЫ ВАЛИДАЦИИ ====================

/**
 * Результат валидации
 */
export interface TelegramValidationResult {
  /** Валидация успешна */
  isValid: boolean;
  /** Ошибка валидации */
  error?: string;
  /** Предупреждения */
  warnings?: string[];
}

/**
 * Результат валидации пользователя
 */
export interface TelegramUserValidationResult extends TelegramValidationResult {
  /** Предупреждения для пользователя */
  warnings?: string[];
}

/**
 * Результат валидации InitData
 */
export interface TelegramInitDataValidationResult extends TelegramValidationResult {
  /** Распарсенные данные */
  parsedData?: TelegramInitData;
}

// ==================== ПРОВАЙДЕРЫ И КОНТЕКСТ ====================

/**
 * Тип контекста Telegram
 */
export interface TelegramContextType extends TelegramAuthState, TelegramWebAppState {
  /** Показать главную кнопку */
  showMainButton: (text: string, onClick: () => void) => void;
  /** Скрыть главную кнопку */
  hideMainButton: () => void;
  /** Показать кнопку назад */
  showBackButton: (onClick: () => void) => void;
  /** Скрыть кнопку назад */
  hideBackButton: () => void;
  /** Haptic feedback */
  hapticFeedback: (type: TelegramHapticFeedbackType) => void;
  /** Показать алерт */
  showAlert: (message: string) => void;
  /** Показать подтверждение */
  showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
  /** Расширить WebApp */
  expand: () => void;
  /** Сообщить о готовности */
  ready: () => void;
  /** Зарегистрировать пользователя */
  registerUser: (fullName: string) => Promise<void>;
  /** Установить webhook URL */
  setWebhookUrl: (url: string) => void;
  /** Включить подтверждение закрытия */
  enableClosingConfirmation: () => void;
  /** Отключить подтверждение закрытия */
  disableClosingConfirmation: () => void;
  /** Открыть ссылку Telegram */
  openTelegramLink: (url: string) => void;
  /** Открыть инвойс */
  openInvoice: (url: string, callback?: (status: TelegramPaymentStatus) => void) => void;
  /** Сохранить в облако */
  saveToCloud: (key: string, data: any) => Promise<boolean>;
  /** Загрузить из облака */
  loadFromCloud: (key: string) => Promise<any>;
}

/**
 * Свойства провайдера Telegram
 */
export interface TelegramProviderProps {
  /** Дочерние элементы */
  children: React.ReactNode;
}

// ==================== ЭКСПОРТ ТИПОВ ====================

// Экспортируем также для обратной совместимости
export type { 
  TelegramUser as TgUser,
  TelegramChat as TgChat,
  TelegramInitData as TgInitData,
  TelegramAuthState as AuthState
};
