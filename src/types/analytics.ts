
export interface LearningMetrics {
  lesson_id: number;
  user_id: string;
  start_time: string;
  completion_time?: string;
  duration_seconds: number;
  score?: number;
  attempts: number;
  completed: boolean;
  difficulty_rating?: number;
  engagement_score: number;
}

export interface BehaviorMetrics {
  user_id: string;
  session_id: string;
  page_path: string;
  action_type: 'click' | 'scroll' | 'focus' | 'blur' | 'navigation';
  element_id?: string;
  timestamp: string;
  duration_ms: number;
  viewport_width: number;
  viewport_height: number;
}

export interface EngagementMetrics {
  user_id: string;
  date: string;
  sessions_count: number;
  total_time_spent: number;
  lessons_viewed: number;
  tests_taken: number;
  average_session_duration: number;
  bounce_rate: number;
  return_visits: number;
}

export interface TelegramMetrics {
  user_id: string;
  telegram_user_id: number;
  app_version: string;
  platform: 'ios' | 'android' | 'web';
  theme: 'light' | 'dark';
  viewport_height: number;
  is_expanded: boolean;
  haptic_feedback_enabled: boolean;
  back_button_clicks: number;
  main_button_clicks: number;
  settings_button_clicks: number;
}

export interface AnalyticsReport {
  period: 'day' | 'week' | 'month' | 'quarter';
  start_date: string;
  end_date: string;
  user_id: string;
  learning_summary: {
    total_lessons: number;
    completed_lessons: number;
    average_score: number;
    total_study_time: number;
    streak_days: number;
  };
  engagement_summary: {
    sessions_count: number;
    average_session_duration: number;
    most_active_day: string;
    preferred_study_time: string;
  };
  performance_trends: {
    scores_trend: number[];
    time_trend: number[];
    engagement_trend: number[];
  };
  recommendations: string[];
}

export interface RealtimeMetrics {
  active_users: number;
  current_lessons_in_progress: number;
  tests_being_taken: number;
  average_page_load_time: number;
  error_rate: number;
  last_updated: string;
}
