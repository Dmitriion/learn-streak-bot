
import { useState, useEffect } from 'react';
import { AnalyticsReport, RealtimeMetrics } from '../types/analytics';
import AnalyticsService from '../services/analytics/AnalyticsService';
import { useTelegram } from '../providers/TelegramProvider';

export const useAnalytics = () => {
  const { user } = useTelegram();
  const [analyticsService] = useState(() => AnalyticsService.getInstance());
  const [currentReport, setCurrentReport] = useState<AnalyticsReport | null>(null);
  const [realtimeMetrics, setRealtimeMetrics] = useState<RealtimeMetrics | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    if (user) {
      analyticsService.initializeTracking(user.id.toString(), user.id);
    }

    return () => {
      analyticsService.stopTracking();
    };
  }, [user, analyticsService]);

  const generateReport = async (period: 'day' | 'week' | 'month' | 'quarter') => {
    if (!user) return;

    setIsGeneratingReport(true);
    try {
      const report = await analyticsService.generateReport(user.id.toString(), period);
      setCurrentReport(report);
      return report;
    } catch (error) {
      console.error('Ошибка генерации отчета:', error);
      throw error;
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const updateRealtimeMetrics = () => {
    const metrics = analyticsService.getRealTimeMetrics();
    setRealtimeMetrics(metrics);
  };

  const startLesson = (lessonId: number): string | null => {
    if (!user) return null;
    return analyticsService.startLesson(user.id.toString(), lessonId);
  };

  const completeLesson = (sessionId: string, score?: number, difficultyRating?: number) => {
    analyticsService.completeLesson(sessionId, score, difficultyRating);
  };

  const updateLessonEngagement = (sessionId: string, engagementScore: number) => {
    analyticsService.updateLessonEngagement(sessionId, engagementScore);
  };

  const exportReportAsCSV = (report: AnalyticsReport): string => {
    return analyticsService.exportToCSV(report);
  };

  const downloadCSV = (report: AnalyticsReport, filename: string = 'analytics_report.csv') => {
    const csv = exportReportAsCSV(report);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    currentReport,
    realtimeMetrics,
    isGeneratingReport,
    generateReport,
    updateRealtimeMetrics,
    startLesson,
    completeLesson,
    updateLessonEngagement,
    exportReportAsCSV,
    downloadCSV
  };
};
