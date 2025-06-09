
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramInitData {
  user?: TelegramUser;
  auth_date: number;
  hash: string;
  start_param?: string;
  chat_type?: string;
  chat_instance?: string;
  [key: string]: any;
}

export interface AuthState {
  isAuthenticated: boolean;
  isRegistered: boolean;
  user: TelegramUser | null;
  registrationStatus: 'idle' | 'checking' | 'registering' | 'success' | 'error';
  error?: string;
}

export interface UserRegistrationData {
  user_id: string;
  username?: string;
  full_name: string;
  course_status: 'not_started' | 'in_progress' | 'paused' | 'completed';
  current_lesson: number;
  last_activity: string;
  score: number;
  telegram_data: TelegramUser;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface UserValidationResult {
  isValid: boolean;
  warnings?: string[];
}

export interface InitDataValidationResult {
  isValid: boolean;
  parsedData?: TelegramInitData;
  error?: string;
}
