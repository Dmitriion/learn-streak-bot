
import crypto from 'crypto';

export interface TelegramInitData {
  user?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
  };
  auth_date: number;
  hash: string;
  [key: string]: any;
}

class TelegramValidationService {
  private static instance: TelegramValidationService;
  private readonly BOT_TOKEN_HASH = 'your_bot_token_hash'; // Должен быть установлен через env

  static getInstance(): TelegramValidationService {
    if (!TelegramValidationService.instance) {
      TelegramValidationService.instance = new TelegramValidationService();
    }
    return TelegramValidationService.instance;
  }

  /**
   * Валидация initData согласно документации Telegram
   * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
   */
  validateInitData(initData: string): { isValid: boolean; parsedData?: TelegramInitData; error?: string } {
    try {
      if (!initData || initData.length === 0) {
        return { isValid: false, error: 'InitData пуст' };
      }

      // Парсим URL-encoded данные
      const urlParams = new URLSearchParams(initData);
      const data: any = {};
      
      for (const [key, value] of urlParams.entries()) {
        if (key === 'user') {
          try {
            data[key] = JSON.parse(value);
          } catch {
            data[key] = value;
          }
        } else {
          data[key] = value;
        }
      }

      const hash = data.hash;
      if (!hash) {
        return { isValid: false, error: 'Отсутствует hash в initData' };
      }

      // Удаляем hash из данных для проверки
      delete data.hash;

      // Проверяем возраст данных (не старше 1 часа)
      const authDate = parseInt(data.auth_date);
      const currentTime = Math.floor(Date.now() / 1000);
      const maxAge = 3600; // 1 час

      if (currentTime - authDate > maxAge) {
        return { isValid: false, error: 'InitData устарел' };
      }

      // В production здесь должна быть проверка HMAC
      // Пока используем базовую проверку для разработки
      const isValid = this.validateHMAC(data, hash);

      return {
        isValid: isValid,
        parsedData: data as TelegramInitData,
        error: isValid ? undefined : 'Невалидная подпись HMAC'
      };

    } catch (error) {
      console.error('Ошибка валидации initData:', error);
      return { isValid: false, error: 'Ошибка парсинга initData' };
    }
  }

  private validateHMAC(data: any, receivedHash: string): boolean {
    // В режиме разработки пропускаем проверку HMAC
    if (process.env.NODE_ENV === 'development') {
      console.warn('Режим разработки: пропуск валидации HMAC');
      return true;
    }

    try {
      // Сортируем ключи и создаем строку для проверки
      const dataCheckString = Object.keys(data)
        .sort()
        .map(key => `${key}=${data[key]}`)
        .join('\n');

      // Создаем секретный ключ из bot token
      const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(this.BOT_TOKEN_HASH)
        .digest();

      // Вычисляем HMAC
      const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

      return calculatedHash === receivedHash;
    } catch (error) {
      console.error('Ошибка вычисления HMAC:', error);
      return false;
    }
  }

  /**
   * Проверка данных пользователя на подозрительную активность
   */
  validateUserData(userData: any): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];

    // Проверка на подозрительные значения
    if (userData.id && userData.id < 0) {
      warnings.push('Подозрительный ID пользователя');
    }

    if (userData.username && userData.username.length > 32) {
      warnings.push('Слишком длинный username');
    }

    if (userData.first_name && userData.first_name.length > 256) {
      warnings.push('Слишком длинное имя');
    }

    return {
      isValid: warnings.length === 0,
      warnings
    };
  }
}

export default TelegramValidationService;
