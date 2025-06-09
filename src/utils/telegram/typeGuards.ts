
import { 
  TelegramUser, 
  TelegramChat, 
  TelegramInitData,
  TelegramUserRegistrationData,
  TelegramMetrics,
  TelegramValidationResult
} from '../../types/TelegramTypes';

/**
 * Type guard для TelegramUser
 */
export function isValidTelegramUser(user: unknown): user is TelegramUser {
  if (!user || typeof user !== 'object') {
    return false;
  }

  const u = user as Record<string, unknown>;
  
  // Обязательные поля
  if (typeof u.id !== 'number' || u.id <= 0) {
    return false;
  }
  
  if (typeof u.first_name !== 'string' || u.first_name.length === 0) {
    return false;
  }

  // Опциональные поля с проверкой типов
  if (u.is_bot !== undefined && typeof u.is_bot !== 'boolean') {
    return false;
  }
  
  if (u.last_name !== undefined && typeof u.last_name !== 'string') {
    return false;
  }
  
  if (u.username !== undefined && typeof u.username !== 'string') {
    return false;
  }
  
  if (u.language_code !== undefined && typeof u.language_code !== 'string') {
    return false;
  }
  
  if (u.is_premium !== undefined && typeof u.is_premium !== 'boolean') {
    return false;
  }
  
  if (u.photo_url !== undefined && typeof u.photo_url !== 'string') {
    return false;
  }

  return true;
}

/**
 * Type guard для TelegramChat
 */
export function isValidTelegramChat(chat: unknown): chat is TelegramChat {
  if (!chat || typeof chat !== 'object') {
    return false;
  }

  const c = chat as Record<string, unknown>;
  
  // Обязательные поля
  if (typeof c.id !== 'number') {
    return false;
  }
  
  if (typeof c.type !== 'string' || 
      !['private', 'group', 'supergroup', 'channel'].includes(c.type)) {
    return false;
  }

  // Опциональные поля с проверкой типов
  if (c.title !== undefined && typeof c.title !== 'string') {
    return false;
  }
  
  if (c.username !== undefined && typeof c.username !== 'string') {
    return false;
  }
  
  if (c.first_name !== undefined && typeof c.first_name !== 'string') {
    return false;
  }
  
  if (c.last_name !== undefined && typeof c.last_name !== 'string') {
    return false;
  }
  
  if (c.is_forum !== undefined && typeof c.is_forum !== 'boolean') {
    return false;
  }

  return true;
}

/**
 * Type guard для TelegramInitData
 */
export function isValidTelegramInitData(data: unknown): data is TelegramInitData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const d = data as Record<string, unknown>;
  
  // Обязательные поля
  if (typeof d.auth_date !== 'number' || d.auth_date <= 0) {
    return false;
  }
  
  if (typeof d.hash !== 'string' || d.hash.length === 0) {
    return false;
  }

  // Опциональные поля с проверкой типов
  if (d.user !== undefined && !isValidTelegramUser(d.user)) {
    return false;
  }
  
  if (d.receiver !== undefined && !isValidTelegramUser(d.receiver)) {
    return false;
  }
  
  if (d.chat !== undefined && !isValidTelegramChat(d.chat)) {
    return false;
  }
  
  if (d.chat_type !== undefined && 
      typeof d.chat_type !== 'string' ||
      !['private', 'group', 'supergroup', 'channel'].includes(d.chat_type as string)) {
    return false;
  }
  
  if (d.chat_instance !== undefined && typeof d.chat_instance !== 'string') {
    return false;
  }
  
  if (d.start_param !== undefined && typeof d.start_param !== 'string') {
    return false;
  }
  
  if (d.can_send_after !== undefined && typeof d.can_send_after !== 'number') {
    return false;
  }

  return true;
}

/**
 * Type guard для TelegramUserRegistrationData
 */
export function isValidTelegramUserRegistrationData(data: unknown): data is TelegramUserRegistrationData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const d = data as Record<string, unknown>;
  
  // Обязательные поля
  const requiredStringFields = ['user_id', 'full_name', 'last_activity', 'registration_date'];
  for (const field of requiredStringFields) {
    if (typeof d[field] !== 'string' || (d[field] as string).length === 0) {
      return false;
    }
  }
  
  if (typeof d.current_lesson !== 'number' || d.current_lesson < 0) {
    return false;
  }
  
  if (typeof d.score !== 'number' || d.score < 0) {
    return false;
  }
  
  if (typeof d.course_status !== 'string' || 
      !['not_started', 'in_progress', 'paused', 'completed'].includes(d.course_status)) {
    return false;
  }
  
  if (!isValidTelegramUser(d.telegram_data)) {
    return false;
  }

  // Опциональные поля
  if (d.username !== undefined && typeof d.username !== 'string') {
    return false;
  }
  
  if (d.subscription_status !== undefined && 
      (typeof d.subscription_status !== 'string' ||
       !['free', 'premium', 'vip'].includes(d.subscription_status))) {
    return false;
  }

  return true;
}

/**
 * Type guard для TelegramMetrics
 */
export function isValidTelegramMetrics(metrics: unknown): metrics is TelegramMetrics {
  if (!metrics || typeof metrics !== 'object') {
    return false;
  }

  const m = metrics as Record<string, unknown>;
  
  // Обязательные строковые поля
  const requiredStringFields = ['user_id', 'app_version'];
  for (const field of requiredStringFields) {
    if (typeof m[field] !== 'string' || (m[field] as string).length === 0) {
      return false;
    }
  }
  
  // Обязательные числовые поля
  const requiredNumberFields = [
    'telegram_user_id', 'viewport_height', 'back_button_clicks', 
    'main_button_clicks', 'settings_button_clicks'
  ];
  for (const field of requiredNumberFields) {
    if (typeof m[field] !== 'number' || m[field] < 0) {
      return false;
    }
  }
  
  // Enum поля
  if (typeof m.platform !== 'string' || 
      !['ios', 'android', 'web'].includes(m.platform)) {
    return false;
  }
  
  if (typeof m.theme !== 'string' || 
      !['light', 'dark'].includes(m.theme)) {
    return false;
  }
  
  // Boolean поля
  const booleanFields = ['is_expanded', 'haptic_feedback_enabled'];
  for (const field of booleanFields) {
    if (typeof m[field] !== 'boolean') {
      return false;
    }
  }

  return true;
}

/**
 * Type guard для TelegramValidationResult
 */
export function isValidationResult(result: unknown): result is TelegramValidationResult {
  if (!result || typeof result !== 'object') {
    return false;
  }

  const r = result as Record<string, unknown>;
  
  if (typeof r.isValid !== 'boolean') {
    return false;
  }
  
  if (r.error !== undefined && typeof r.error !== 'string') {
    return false;
  }
  
  if (r.warnings !== undefined && 
      (!Array.isArray(r.warnings) || !r.warnings.every(w => typeof w === 'string'))) {
    return false;
  }

  return true;
}
