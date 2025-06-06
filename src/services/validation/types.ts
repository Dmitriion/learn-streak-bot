
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

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
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
