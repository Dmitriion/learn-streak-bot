
import { useState, useEffect } from 'react';
import AutomationManager from '../services/automation/AutomationManager';
import { AutomationTrigger } from '../types/automation';
import { useTelegram } from '../providers/TelegramProvider';

export const useAutomation = () => {
  const { user } = useTelegram();
  const [automationManager] = useState(() => AutomationManager.getInstance());
  const [triggers, setTriggers] = useState<AutomationTrigger[]>([]);
  const [webhookUrl, setWebhookUrl] = useState<string>('');

  useEffect(() => {
    const enabledTriggers = automationManager.getEnabledTriggers();
    setTriggers(enabledTriggers);
  }, [automationManager]);

  const updateWebhookUrl = (url: string) => {
    setWebhookUrl(url);
    automationManager.setN8NWebhookUrl(url);
  };

  const toggleTrigger = (triggerId: string, enabled: boolean) => {
    automationManager.toggleTrigger(triggerId, enabled);
    const updatedTriggers = automationManager.getEnabledTriggers();
    setTriggers(updatedTriggers);
  };

  // Методы для триггеринга событий
  const triggerLessonCompleted = async (lessonId: number, score?: number) => {
    if (!user) return;
    await automationManager.onLessonCompleted(user.id.toString(), lessonId, score);
  };

  const triggerTestPassed = async (lessonId: number, score: number, totalQuestions: number) => {
    if (!user) return;
    await automationManager.onTestPassed(user.id.toString(), lessonId, score, totalQuestions);
  };

  const triggerPaymentSuccess = async (planId: string, amount: number) => {
    if (!user) return;
    await automationManager.onPaymentSuccess(user.id.toString(), planId, amount);
  };

  const triggerCourseCompleted = async (totalLessons: number, finalScore: number) => {
    if (!user) return;
    await automationManager.onCourseCompleted(user.id.toString(), totalLessons, finalScore);
  };

  return {
    triggers,
    webhookUrl,
    updateWebhookUrl,
    toggleTrigger,
    triggerLessonCompleted,
    triggerTestPassed,
    triggerPaymentSuccess,
    triggerCourseCompleted
  };
};
