
import LoggingService from '../services/LoggingService';

const logger = LoggingService.getInstance();

/**
 * Безопасно парсит ID из строки с валидацией
 * @param idString - строка для парсинга
 * @param defaultValue - значение по умолчанию (по умолчанию 1)
 * @param paramName - имя параметра для логирования
 * @returns валидный положительный integer
 */
export function safeParseId(
  idString: string | undefined, 
  defaultValue: number = 1,
  paramName: string = 'id'
): number {
  // Если строка пустая или undefined
  if (!idString || idString.trim() === '') {
    logger.debug(`RouteUtils: параметр ${paramName} пустой, используем значение по умолчанию`, { 
      defaultValue 
    });
    return defaultValue;
  }

  // Парсим число
  const parsed = parseInt(idString.trim(), 10);

  // Проверяем что результат валидный
  if (isNaN(parsed)) {
    logger.warn(`RouteUtils: не удалось распарсить ${paramName} как число`, { 
      idString, 
      defaultValue 
    });
    return defaultValue;
  }

  // Проверяем что число положительное
  if (parsed <= 0) {
    logger.warn(`RouteUtils: ${paramName} должен быть положительным числом`, { 
      parsed, 
      defaultValue 
    });
    return defaultValue;
  }

  logger.debug(`RouteUtils: успешно распарсен ${paramName}`, { parsed });
  return parsed;
}

/**
 * Валидирует что ID находится в допустимом диапазоне
 * @param id - ID для проверки
 * @param maxId - максимальное допустимое значение
 * @param defaultValue - значение по умолчанию если ID вне диапазона
 * @returns валидный ID в допустимом диапазоне
 */
export function validateIdRange(
  id: number, 
  maxId: number, 
  defaultValue: number = 1
): number {
  if (id > maxId) {
    logger.warn(`RouteUtils: ID ${id} превышает максимальное значение ${maxId}`, { 
      id, 
      maxId, 
      defaultValue 
    });
    return defaultValue;
  }
  
  return id;
}
