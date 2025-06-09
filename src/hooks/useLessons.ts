
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import LessonsService, { Lesson, UserProgress } from '../services/LessonsService';
import { useTelegram } from '../providers/TelegramProvider';

const lessonsService = LessonsService.getInstance();

export const useLessons = () => {
  const { user } = useTelegram();
  
  return useQuery({
    queryKey: ['lessons', user?.id],
    queryFn: () => lessonsService.getLessons(user?.id?.toString()),
    staleTime: 5 * 60 * 1000, // 5 минут
    retry: 3,
  });
};

export const useUserProgress = () => {
  const { user } = useTelegram();
  
  return useQuery({
    queryKey: ['userProgress', user?.id],
    queryFn: () => lessonsService.getUserProgress(user?.id?.toString()),
    staleTime: 5 * 60 * 1000, // 5 минут
    retry: 3,
  });
};

export const useUpdateLessonProgress = () => {
  const { user } = useTelegram();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ lessonId, score }: { lessonId: number; score?: number }) =>
      lessonsService.updateLessonProgress(lessonId, user?.id?.toString(), score),
    onSuccess: () => {
      // Обновляем кэш после успешного обновления
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
    },
  });
};
