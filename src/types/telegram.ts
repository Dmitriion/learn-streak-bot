
// Перенаправление на унифицированные типы
export { 
  TelegramContextType,
  TelegramProviderProps
} from './TelegramTypes';

// Сохраняем обратную совместимость
export type { TelegramContextType as TelegramContext };
export type { TelegramProviderProps as TelegramProviderProperties };
