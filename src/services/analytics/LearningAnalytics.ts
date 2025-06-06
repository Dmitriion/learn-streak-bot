
import { LearningMetrics } from '../../types/analytics';
import LoggingService from '../LoggingService';
import AutomationManager from '../automation/AutomationManager';

class LearningAnalytics {
  private static instance: LearningAnalytics;
  private logger: LoggingService;
  private automationManager: AutomationManager;
  private currentSessions: Map<string, LearningMetrics> = new Map();

  constructor() {
    this.logger = LoggingService.getInstance();
    this.automationManager = AutomationManager.getInstance();
  }

  static getInstance(): LearningAnalytics {
    if (!LearningAnalytics.instance) {
      LearningAnalytics.instance = new LearningAnalytics();
    }
    return LearningAnalytics.instance;
  }

  startLesson(userId: string, lessonId: number): string {
    const sessionId = `${userId}_${lessonId}_${Date.now()}`;
    const metrics: LearningMetrics = {
      lesson_id: lessonId,
      user_id: userId,
      start_time: new Date().toISOString(),
      duration_seconds: 0,
      attempts: 1,
      completed: false,
      engagement_score: 0
    };

    this.currentSessions.set(sessionId, metrics);
    this.logger.info('Урок начат', { userId, lessonId, sessionId });
    
    return sessionId;
  }

  updateEngagement(sessionId: string, engagementScore: number) {
    const session = this.currentSessions.get(sessionId);
    if (session) {
      session.engagement_score = engagementScore;
      session.duration_seconds = Math.floor((Date.now() - new Date(session.start_time).getTime()) / 1000);
    }
  }

  completeLesson(sessionId: string, score?: number, difficultyRating?: number) {
    const session = this.currentSessions.get(sessionId);
    if (!session) return;

    session.completion_time = new Date().toISOString();
    session.duration_seconds = Math.floor((Date.now() - new Date(session.start_time).getTime()) / 1000);
    session.completed = true;
    session.score = score;
    session.difficulty_rating = difficultyRating;

    this.logger.info('Урок завершен', {
      userId: session.user_id,
      lessonId: session.lesson_id,
      score,
      duration: session.duration_seconds
    });

    // Отправляем данные в N8N для автоматизации
    this.automationManager.onLessonCompleted(
      session.user_id,
      session.lesson_id,
      score
    );

    // Сохраняем в локальное хранилище для дальнейшего анализа
    this.saveMetrics(session);
    this.currentSessions.delete(sessionId);
  }

  private saveMetrics(metrics: LearningMetrics) {
    try {
      const existingData = localStorage.getItem('learning_metrics') || '[]';
      const metricsArray = JSON.parse(existingData);
      metricsArray.push(metrics);
      
      // Храним только последние 1000 записей
      if (metricsArray.length > 1000) {
        metricsArray.splice(0, metricsArray.length - 1000);
      }
      
      localStorage.setItem('learning_metrics', JSON.stringify(metricsArray));
    } catch (error) {
      this.logger.error('Ошибка сохранения метрик обучения', { error });
    }
  }

  getLearningMetrics(userId: string, days: number = 30): LearningMetrics[] {
    try {
      const data = localStorage.getItem('learning_metrics') || '[]';
      const allMetrics = JSON.parse(data) as LearningMetrics[];
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      return allMetrics.filter(metric => 
        metric.user_id === userId && 
        new Date(metric.start_time) > cutoffDate
      );
    } catch (error) {
      this.logger.error('Ошибка загрузки метрик обучения', { error });
      return [];
    }
  }

  calculateEngagementScore(timeSpent: number, interactions: number, completion: boolean): number {
    let score = 0;
    
    // Базовый балл за время (0-40 баллов)
    score += Math.min(timeSpent / 60, 40); // 1 балл за минуту, максимум 40
    
    // Балл за взаимодействия (0-30 баллов)
    score += Math.min(interactions * 2, 30);
    
    // Бонус за завершение (30 баллов)
    if (completion) score += 30;
    
    return Math.round(Math.min(score, 100));
  }
}

export default LearningAnalytics;
