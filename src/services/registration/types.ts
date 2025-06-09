
export interface UserRegistrationData {
  user_id: string;
  username?: string;
  full_name: string;
  course_status: 'not_started' | 'in_progress' | 'paused' | 'completed';
  current_lesson: number;
  last_activity: string;
  score: number;
  subscription_status?: 'free' | 'premium' | 'vip';
  subscription_expires?: string;
  payment_provider?: string;
  telegram_data?: any;
}

export interface N8NWebhookResponse {
  success: boolean;
  message?: string;
  user_exists?: boolean;
  subscription_status?: any;
}

export interface RegistrationServiceConfig {
  baseWebhookUrl: string;
  useMockMode: boolean;
}
