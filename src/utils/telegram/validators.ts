
/**
 * Валидаторы для специфических Telegram полей
 */

/**
 * Проверка корректности ID пользователя Telegram
 */
export function isValidTelegramUserId(id: unknown): id is number {
  return typeof id === 'number' && 
         id > 0 && 
         id <= Number.MAX_SAFE_INTEGER && 
         Number.isInteger(id);
}

/**
 * Проверка корректности username Telegram
 */
export function isValidTelegramUsername(username: unknown): username is string {
  if (typeof username !== 'string') {
    return false;
  }
  
  // Username должен быть от 5 до 32 символов, содержать только латинские буквы, цифры и подчеркивания
  const usernameRegex = /^[a-zA-Z0-9_]{5,32}$/;
  return usernameRegex.test(username);
}

/**
 * Проверка корректности языкового кода
 */
export function isValidLanguageCode(code: unknown): code is string {
  if (typeof code !== 'string') {
    return false;
  }
  
  // Языковой код в формате ISO 639-1 (2 символа) или ISO 639-1 + ISO 3166-1 (5 символов с дефисом)
  const langCodeRegex = /^[a-z]{2}(-[A-Z]{2})?$/;
  return langCodeRegex.test(code);
}
