
import { UserRegistrationData } from '../registration/types';

export interface MockUserData extends UserRegistrationData {
  registration_date: string;
  subscription_status: 'free' | 'premium' | 'vip';
  subscription_expires?: string;
}

export interface UserUpdateData {
  last_activity?: string;
  subscription_status?: 'free' | 'premium' | 'vip';
  subscription_expires?: string;
  current_lesson?: number;
  score?: number;
  course_status?: 'not_started' | 'in_progress' | 'paused' | 'completed';
}

export interface SubscriptionUpdateData {
  subscription_status?: 'free' | 'premium' | 'vip';
  subscription_expires?: string;
}

// Re-export types from MockDataTypes for compatibility
export type {
  MockDataSet,
  MockLessonData,
  MockQuestionData,
  MockSettingsData
} from './MockDataTypes';
