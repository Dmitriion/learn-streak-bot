
import LoggingService from '../LoggingService';
import EnvironmentManager from '../environment/EnvironmentManager';

interface MockDataSet {
  version: string;
  users: MockUserData[];
  lessons: MockLessonData[];
  settings: MockSettingsData;
}

interface MockUserData {
  user_id: string;
  username?: string;
  full_name: string;
  course_status: 'not_started' | 'in_progress' | 'paused' | 'completed';
  current_lesson: number;
  last_activity: string;
  score: number;
  subscription_status: 'free' | 'premium' | 'vip';
  registration_date: string;
}

interface MockLessonData {
  lesson_id: number;
  title: string;
  content: string;
  questions: MockQuestionData[];
}

interface MockQuestionData {
  question_id: string;
  text: string;
  correct_answer: string;
  options?: string[];
}

interface MockSettingsData {
  webhook_url: string;
  automation_enabled: boolean;
  notifications_enabled: boolean;
}

class MockDataProvider {
  private static instance: MockDataProvider;
  private logger: LoggingService;
  private environmentManager: EnvironmentManager;
  private currentDataSet: MockDataSet;

  constructor() {
    this.logger = LoggingService.getInstance();
    this.environmentManager = EnvironmentManager.getInstance();
    this.currentDataSet = this.createDefaultDataSet();
  }

  static getInstance(): MockDataProvider {
    if (!MockDataProvider.instance) {
      MockDataProvider.instance = new MockDataProvider();
    }
    return MockDataProvider.instance;
  }

  private createDefaultDataSet(): MockDataSet {
    return {
      version: '1.0.0',
      users: [
        {
          user_id: '12345',
          username: 'anna_petrova',
          full_name: 'Анна Петрова',
          course_status: 'in_progress',
          current_lesson: 3,
          last_activity: new Date().toISOString(),
          score: 85,
          subscription_status: 'premium',
          registration_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          user_id: '67890',
          username: 'ivan_dev',
          full_name: 'Иван Разработчик',
          course_status: 'completed',
          current_lesson: 6,
          last_activity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          score: 95,
          subscription_status: 'vip',
          registration_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      lessons: [
        {
          lesson_id: 1,
          title: 'Что такое менторинг',
          content: 'Менторинг - это процесс передачи знаний и опыта...',
          questions: [
            {
              question_id: 'q1_1',
              text: 'Что является ключевым в менторинге?',
              correct_answer: 'Передача опыта',
              options: ['Передача опыта', 'Контроль', 'Оценка', 'Критика']
            }
          ]
        }
      ],
      settings: {
        webhook_url: 'https://demo-n8n.example.com/webhook',
        automation_enabled: true,
        notifications_enabled: true
      }
    };
  }

  isEnabled(): boolean {
    return this.environmentManager.shouldUseMockData();
  }

  getUserData(): MockUserData[] {
    if (!this.isEnabled()) {
      this.logger.warn('MockDataProvider: попытка получить mock данные в production');
      return [];
    }
    return [...this.currentDataSet.users];
  }

  getLessonsData(): MockLessonData[] {
    if (!this.isEnabled()) {
      this.logger.warn('MockDataProvider: попытка получить mock уроки в production');
      return [];
    }
    return [...this.currentDataSet.lessons];
  }

  getSettingsData(): MockSettingsData {
    if (!this.isEnabled()) {
      this.logger.warn('MockDataProvider: попытка получить mock настройки в production');
      return {
        webhook_url: '',
        automation_enabled: false,
        notifications_enabled: false
      };
    }
    return { ...this.currentDataSet.settings };
  }

  addMockUser(userData: Partial<MockUserData>): MockUserData {
    if (!this.isEnabled()) {
      throw new Error('Mock данные недоступны в production');
    }

    const newUser: MockUserData = {
      user_id: userData.user_id || `mock_${Date.now()}`,
      username: userData.username,
      full_name: userData.full_name || 'Тестовый пользователь',
      course_status: userData.course_status || 'not_started',
      current_lesson: userData.current_lesson || 0,
      last_activity: userData.last_activity || new Date().toISOString(),
      score: userData.score || 0,
      subscription_status: userData.subscription_status || 'free',
      registration_date: userData.registration_date || new Date().toISOString()
    };

    this.currentDataSet.users.push(newUser);
    this.logger.debug('MockDataProvider: добавлен mock пользователь', { userId: newUser.user_id });
    
    return newUser;
  }

  updateMockUser(userId: string, updates: Partial<MockUserData>): MockUserData | null {
    if (!this.isEnabled()) {
      throw new Error('Mock данные недоступны в production');
    }

    const userIndex = this.currentDataSet.users.findIndex(u => u.user_id === userId);
    if (userIndex === -1) {
      return null;
    }

    this.currentDataSet.users[userIndex] = {
      ...this.currentDataSet.users[userIndex],
      ...updates,
      last_activity: new Date().toISOString()
    };

    this.logger.debug('MockDataProvider: обновлен mock пользователь', { userId, updates });
    return this.currentDataSet.users[userIndex];
  }

  clearMockData() {
    if (!this.isEnabled()) {
      throw new Error('Mock данные недоступны в production');
    }

    this.currentDataSet = this.createDefaultDataSet();
    this.logger.info('MockDataProvider: mock данные очищены');
  }

  getDataSetVersion(): string {
    return this.currentDataSet.version;
  }

  exportMockData(): MockDataSet {
    if (!this.isEnabled()) {
      throw new Error('Mock данные недоступны в production');
    }

    return JSON.parse(JSON.stringify(this.currentDataSet));
  }

  importMockData(dataSet: MockDataSet) {
    if (!this.isEnabled()) {
      throw new Error('Mock данные недоступны в production');
    }

    this.currentDataSet = dataSet;
    this.logger.info('MockDataProvider: mock данные импортированы', { version: dataSet.version });
  }
}

export default MockDataProvider;
