
import LoggingService from './LoggingService';
import MockDataProvider from './mock/MockDataProvider';
import EnvironmentManager from './environment/EnvironmentManager';
import { MockLessonData } from './mock/MockDataTypes';

export interface Lesson {
  id: number;
  title: string;
  description: string;
  duration: number;
  completed: boolean;
  score: number | null;
  unlocked: boolean;
  content?: string;
}

export interface UserProgress {
  completedLessons: number;
  totalLessons: number;
  averageScore: number;
  currentLesson: number;
}

class LessonsService {
  private static instance: LessonsService;
  private logger: LoggingService;
  private environmentManager: EnvironmentManager;
  private mockDataProvider: MockDataProvider;

  constructor() {
    this.logger = LoggingService.getInstance();
    this.environmentManager = EnvironmentManager.getInstance();
    this.mockDataProvider = MockDataProvider.getInstance();
  }

  static getInstance(): LessonsService {
    if (!LessonsService.instance) {
      LessonsService.instance = new LessonsService();
    }
    return LessonsService.instance;
  }

  async getLessons(userId?: string): Promise<Lesson[]> {
    try {
      this.logger.info('LessonsService: Получение списка уроков', { userId });

      // В production это будет реальный API вызов
      if (this.environmentManager.isProduction() && !this.environmentManager.shouldUseMockData()) {
        // TODO: Здесь будет реальный API вызов
        throw new Error('Production API для уроков не настроен');
      }

      // Используем Mock данные
      return this.getMockLessons(userId);
    } catch (error) {
      this.logger.error('LessonsService: Ошибка получения уроков', { error, userId });
      throw error;
    }
  }

  async getUserProgress(userId?: string): Promise<UserProgress> {
    try {
      this.logger.info('LessonsService: Получение прогресса пользователя', { userId });

      const lessons = await this.getLessons(userId);
      const completedLessons = lessons.filter(lesson => lesson.completed).length;
      const completedScores = lessons
        .filter(lesson => lesson.completed && lesson.score !== null)
        .map(lesson => lesson.score!);
      
      const averageScore = completedScores.length > 0 
        ? completedScores.reduce((sum, score) => sum + score, 0) / completedScores.length 
        : 0;

      const currentLessonIndex = lessons.findIndex(lesson => !lesson.completed);
      const currentLesson = currentLessonIndex >= 0 ? currentLessonIndex + 1 : lessons.length;

      return {
        completedLessons,
        totalLessons: lessons.length,
        averageScore: Math.round(averageScore),
        currentLesson
      };
    } catch (error) {
      this.logger.error('LessonsService: Ошибка получения прогресса', { error, userId });
      throw error;
    }
  }

  private async getMockLessons(userId?: string): Promise<Lesson[]> {
    // Имитируем задержку сети
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockLessons = this.mockDataProvider.getLessonsData();
    
    // Получаем прогресс пользователя из Mock данных
    const mockUsers = this.mockDataProvider.getUserData();
    const user = userId ? mockUsers.find(u => u.user_id === userId) : mockUsers[0];
    
    return mockLessons.map(mockLesson => this.convertMockLessonToLesson(mockLesson, user));
  }

  private convertMockLessonToLesson(mockLesson: MockLessonData, user?: any): Lesson {
    // Простая логика для определения завершенности урока
    const isCompleted = user ? user.current_lesson > mockLesson.lesson_id : false;
    const isUnlocked = user ? user.current_lesson >= mockLesson.lesson_id : mockLesson.lesson_id === 1;
    
    return {
      id: mockLesson.lesson_id,
      title: mockLesson.title,
      description: mockLesson.content.substring(0, 100) + '...',
      duration: 15 + (mockLesson.lesson_id * 5), // Простая формула для длительности
      completed: isCompleted,
      score: isCompleted ? 85 + Math.floor(Math.random() * 15) : null, // Случайный балл для завершенных
      unlocked: isUnlocked,
      content: mockLesson.content
    };
  }

  async updateLessonProgress(lessonId: number, userId?: string, score?: number): Promise<void> {
    try {
      this.logger.info('LessonsService: Обновление прогресса урока', { lessonId, userId, score });

      if (this.environmentManager.isProduction() && !this.environmentManager.shouldUseMockData()) {
        // TODO: Здесь будет реальный API вызов
        throw new Error('Production API для обновления прогресса не настроен');
      }

      // Mock обновление
      const mockUsers = this.mockDataProvider.getUserData();
      const user = userId ? mockUsers.find(u => u.user_id === userId) : mockUsers[0];
      
      if (user && user.current_lesson < lessonId) {
        user.current_lesson = lessonId;
        user.last_activity = new Date().toISOString();
        if (score) {
          user.score = Math.max(user.score, score);
        }
      }
    } catch (error) {
      this.logger.error('LessonsService: Ошибка обновления прогресса', { error, lessonId, userId });
      throw error;
    }
  }
}

export default LessonsService;
