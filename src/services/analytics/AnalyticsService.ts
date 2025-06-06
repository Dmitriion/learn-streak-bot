
import { AnalyticsReport, RealtimeMetrics } from '../../types/analytics';
import LearningAnalytics from './LearningAnalytics';
import BehaviorTracker from './BehaviorTracker';
import TelegramAnalytics from './TelegramAnalytics';
import PerformanceService from '../PerformanceService';
import LoggingService from '../LoggingService';
import AutomationManager from '../automation/AutomationManager';

class AnalyticsService {
  private static instance: AnalyticsService;
  private learningAnalytics: LearningAnalytics;
  private behaviorTracker: BehaviorTracker;
  private telegramAnalytics: TelegramAnalytics;
  private performanceService: PerformanceService;
  private automationManager: AutomationManager;
  private logger: LoggingService;

  constructor() {
    this.learningAnalytics = LearningAnalytics.getInstance();
    this.behaviorTracker = BehaviorTracker.getInstance();
    this.telegramAnalytics = TelegramAnalytics.getInstance();
    this.performanceService = PerformanceService.getInstance();
    this.automationManager = AutomationManager.getInstance();
    this.logger = LoggingService.getInstance();
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  initializeTracking(userId: string, telegramUserId?: number) {
    this.behaviorTracker.startTracking(userId);
    if (telegramUserId) {
      this.telegramAnalytics.initializeTelegramMetrics(userId, telegramUserId);
    }
    this.logger.info('Аналитика инициализирована', { userId });
  }

  stopTracking() {
    this.behaviorTracker.stopTracking();
  }

  // Методы для трекинга обучения
  startLesson(userId: string, lessonId: number): string {
    return this.learningAnalytics.startLesson(userId, lessonId);
  }

  completeLesson(sessionId: string, score?: number, difficultyRating?: number) {
    this.learningAnalytics.completeLesson(sessionId, score, difficultyRating);
  }

  updateLessonEngagement(sessionId: string, engagementScore: number) {
    this.learningAnalytics.updateEngagement(sessionId, engagementScore);
  }

  // Генерация отчетов
  async generateReport(userId: string, period: 'day' | 'week' | 'month' | 'quarter'): Promise<AnalyticsReport> {
    const days = this.getPeriodDays(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const endDate = new Date();

    const learningMetrics = this.learningAnalytics.getLearningMetrics(userId, days);
    const behaviorMetrics = this.behaviorTracker.getBehaviorMetrics(userId, days * 24);

    // Вычисляем агрегированные данные
    const completedLessons = learningMetrics.filter(m => m.completed);
    const totalStudyTime = learningMetrics.reduce((sum, m) => sum + m.duration_seconds, 0);
    const averageScore = completedLessons.length > 0 
      ? completedLessons.reduce((sum, m) => sum + (m.score || 0), 0) / completedLessons.length 
      : 0;

    // Вычисляем streak
    const streakDays = this.calculateStreakDays(learningMetrics);

    // Анализируем поведение
    const uniqueDays = new Set(behaviorMetrics.map(m => m.timestamp.split('T')[0])).size;
    const totalSessions = new Set(behaviorMetrics.map(m => m.session_id)).size;
    const averageSessionDuration = totalSessions > 0 ? totalStudyTime / totalSessions : 0;

    // Генерируем тренды
    const trends = this.generateTrends(learningMetrics, days);

    const report: AnalyticsReport = {
      period,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      user_id: userId,
      learning_summary: {
        total_lessons: learningMetrics.length,
        completed_lessons: completedLessons.length,
        average_score: Math.round(averageScore),
        total_study_time: totalStudyTime,
        streak_days: streakDays
      },
      engagement_summary: {
        sessions_count: totalSessions,
        average_session_duration: Math.round(averageSessionDuration),
        most_active_day: this.getMostActiveDay(behaviorMetrics),
        preferred_study_time: this.getPreferredStudyTime(learningMetrics)
      },
      performance_trends: trends,
      recommendations: this.generateRecommendations(learningMetrics, behaviorMetrics)
    };

    // Отправляем отчет в N8N для дальнейшей обработки
    await this.sendReportToN8N(report);

    return report;
  }

  private getPeriodDays(period: 'day' | 'week' | 'month' | 'quarter'): number {
    switch (period) {
      case 'day': return 1;
      case 'week': return 7;
      case 'month': return 30;
      case 'quarter': return 90;
      default: return 7;
    }
  }

  private calculateStreakDays(metrics: any[]): number {
    const studyDates = [...new Set(metrics.map(m => m.start_time.split('T')[0]))].sort();
    if (studyDates.length === 0) return 0;

    let streak = 1;
    for (let i = studyDates.length - 2; i >= 0; i--) {
      const current = new Date(studyDates[i + 1]);
      const previous = new Date(studyDates[i]);
      const diffDays = (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  private generateTrends(metrics: any[], days: number): { scores_trend: number[], time_trend: number[], engagement_trend: number[] } {
    const dailyData = Array(days).fill(0).map(() => ({ scores: [], time: 0, engagement: [] }));
    
    metrics.forEach(metric => {
      const dayIndex = Math.floor((Date.now() - new Date(metric.start_time).getTime()) / (1000 * 60 * 60 * 24));
      if (dayIndex >= 0 && dayIndex < days) {
        const index = days - 1 - dayIndex;
        if (metric.score) dailyData[index].scores.push(metric.score);
        dailyData[index].time += metric.duration_seconds;
        dailyData[index].engagement.push(metric.engagement_score);
      }
    });

    return {
      scores_trend: dailyData.map(d => d.scores.length ? d.scores.reduce((a, b) => a + b) / d.scores.length : 0),
      time_trend: dailyData.map(d => d.time / 60), // в минутах
      engagement_trend: dailyData.map(d => d.engagement.length ? d.engagement.reduce((a, b) => a + b) / d.engagement.length : 0)
    };
  }

  private getMostActiveDay(behaviorMetrics: any[]): string {
    const dayCount: { [key: string]: number } = {};
    behaviorMetrics.forEach(metric => {
      const day = new Date(metric.timestamp).toLocaleDateString('ru-RU', { weekday: 'long' });
      dayCount[day] = (dayCount[day] || 0) + 1;
    });
    
    return Object.keys(dayCount).reduce((a, b) => dayCount[a] > dayCount[b] ? a : b, 'Понедельник');
  }

  private getPreferredStudyTime(learningMetrics: any[]): string {
    const hourCount: { [key: number]: number } = {};
    learningMetrics.forEach(metric => {
      const hour = new Date(metric.start_time).getHours();
      hourCount[hour] = (hourCount[hour] || 0) + 1;
    });
    
    const preferredHour = Object.keys(hourCount).reduce((a, b) => hourCount[+a] > hourCount[+b] ? a : b, '10');
    return `${preferredHour}:00`;
  }

  private generateRecommendations(learningMetrics: any[], behaviorMetrics: any[]): string[] {
    const recommendations: string[] = [];
    
    const avgScore = learningMetrics.filter(m => m.score).reduce((sum, m) => sum + m.score, 0) / learningMetrics.filter(m => m.score).length;
    const avgTime = learningMetrics.reduce((sum, m) => sum + m.duration_seconds, 0) / learningMetrics.length / 60;
    
    if (avgScore < 70) {
      recommendations.push('Рекомендуется повторить материал для улучшения понимания');
    }
    
    if (avgTime < 10) {
      recommendations.push('Попробуйте уделять больше времени изучению каждого урока');
    }
    
    if (behaviorMetrics.length < 50) {
      recommendations.push('Больше взаимодействуйте с материалом для лучшего усвоения');
    }
    
    const recentActivity = learningMetrics.filter(m => 
      (Date.now() - new Date(m.start_time).getTime()) < 7 * 24 * 60 * 60 * 1000
    );
    
    if (recentActivity.length === 0) {
      recommendations.push('Вернитесь к обучению! Регулярность - ключ к успеху');
    }
    
    return recommendations;
  }

  private async sendReportToN8N(report: AnalyticsReport) {
    try {
      // Используем существующий AutomationManager для отправки отчета
      await this.automationManager.onUserInactive(
        report.user_id, 
        0 // Не неактивный пользователь, просто отправляем отчет
      );
    } catch (error) {
      this.logger.error('Ошибка отправки отчета в N8N', { error });
    }
  }

  getRealTimeMetrics(): RealtimeMetrics {
    const performanceMetrics = this.performanceService.getMetrics();
    
    return {
      active_users: 1, // В данной реализации один пользователь
      current_lessons_in_progress: this.getCurrentLessonsInProgress(),
      tests_being_taken: 0, // Можно расширить позже
      average_page_load_time: performanceMetrics.pageLoadTime || 0,
      error_rate: this.calculateErrorRate(),
      last_updated: new Date().toISOString()
    };
  }

  private getCurrentLessonsInProgress(): number {
    // Можно расширить для подсчета активных сессий
    return 0;
  }

  private calculateErrorRate(): number {
    // Простая реализация - можно расширить
    return 0;
  }

  // Методы для экспорта данных
  exportToCSV(report: AnalyticsReport): string {
    const csvData = [
      ['Период', report.period],
      ['Дата начала', report.start_date],
      ['Дата окончания', report.end_date],
      [''],
      ['Обучение'],
      ['Всего уроков', report.learning_summary.total_lessons],
      ['Завершено уроков', report.learning_summary.completed_lessons],
      ['Средний балл', report.learning_summary.average_score],
      ['Время обучения (сек)', report.learning_summary.total_study_time],
      ['Дней подряд', report.learning_summary.streak_days],
      [''],
      ['Вовлеченность'],
      ['Сессий', report.engagement_summary.sessions_count],
      ['Средняя длительность сессии', report.engagement_summary.average_session_duration],
      ['Самый активный день', report.engagement_summary.most_active_day],
      ['Предпочитаемое время', report.engagement_summary.preferred_study_time]
    ];

    return csvData.map(row => row.join(',')).join('\n');
  }
}

export default AnalyticsService;
