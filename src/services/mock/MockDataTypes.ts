
export interface MockDataSet {
  version: string;
  users: MockUserData[];
  lessons: MockLessonData[];
  settings: MockSettingsData;
}

export interface MockUserData {
  user_id: string;
  username?: string;
  full_name: string;
  course_status: 'not_started' | 'in_progress' | 'paused' | 'completed';
  current_lesson: number;
  last_activity: string;
  score: number;
  subscription_status: 'free' | 'premium' | 'vip';
  subscription_expires?: string;
  registration_date: string;
}

export interface MockLessonData {
  lesson_id: number;
  title: string;
  content: string;
  questions: MockQuestionData[];
}

export interface MockQuestionData {
  question_id: string;
  text: string;
  correct_answer: string;
  options?: string[];
}

export interface MockSettingsData {
  webhook_url: string;
  automation_enabled: boolean;
  notifications_enabled: boolean;
}
