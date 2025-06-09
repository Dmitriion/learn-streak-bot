
export interface N8NWebhookEvent {
  event_type: 'user_registered' | 'lesson_completed' | 'test_passed' | 'payment_success' | 'course_completed' | 'user_inactive' | 'logs_batch';
  user_id: string;
  timestamp: string;
  data: Record<string, any>;
  telegram_data?: {
    user_id: number;
    username?: string;
    first_name: string;
    last_name?: string;
  };
}

// Универсальный тип для автоматизации
export interface AutomationEvent {
  type: string;
  user_id: string;
  timestamp: string;
  data: Record<string, any>;
  telegram_data?: {
    user_id: number;
    username?: string;
    first_name: string;
    last_name?: string;
  };
}

export interface AutomationTrigger {
  id: string;
  name: string;
  event_type: N8NWebhookEvent['event_type'];
  webhook_url: string;
  enabled: boolean;
  description: string;
}

export interface AutomationConfig {
  base_webhook_url: string;
  enabled_triggers: AutomationTrigger[];
  retry_settings: {
    max_retries: number;
    retry_delay: number;
  };
}

export interface N8NWebhookResponse {
  success: boolean;
  message?: string;
  workflow_id?: string;
  execution_id?: string;
}
