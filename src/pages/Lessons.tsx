
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, CheckCircle, Clock, Lock, AlertCircle } from 'lucide-react';
import { useTelegram } from '../providers/TelegramProvider';
import { useTelegramNavigation } from '../hooks/useTelegramNavigation';
import { useLessons, useUserProgress } from '../hooks/useLessons';

const LessonSkeleton = () => (
  <Card className="border-0 shadow-lg">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <Skeleton className="h-5 w-3/4" />
    </CardHeader>
    <CardContent className="space-y-3 pt-0">
      <Skeleton className="h-4 w-full" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-7 w-16 rounded" />
      </div>
    </CardContent>
  </Card>
);

const ErrorState = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
  <Card className="border-red-200 bg-red-50">
    <CardContent className="p-6 text-center space-y-4">
      <AlertCircle className="h-12 w-12 text-red-600 mx-auto" />
      <div>
        <h3 className="text-lg font-semibold text-red-800">Ошибка загрузки</h3>
        <p className="text-sm text-red-600 mt-1">{error.message}</p>
      </div>
      <Button onClick={onRetry} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
        Попробовать снова
      </Button>
    </CardContent>
  </Card>
);

const Lessons = () => {
  const { hideMainButton, hapticFeedback } = useTelegram();
  const { navigate } = useTelegramNavigation();
  
  const { 
    data: lessons, 
    isLoading: lessonsLoading, 
    error: lessonsError, 
    refetch: refetchLessons 
  } = useLessons();
  
  const { 
    data: userProgress, 
    isLoading: progressLoading 
  } = useUserProgress();

  useEffect(() => {
    hideMainButton();
  }, [hideMainButton]);

  const handleLessonClick = (lesson: any) => {
    if (lesson.unlocked) {
      hapticFeedback('light');
      navigate('lesson-detail', { lessonId: lesson.id });
    }
  };

  // Показываем ошибку если есть проблемы с загрузкой
  if (lessonsError) {
    return (
      <div className="p-4">
        <ErrorState 
          error={lessonsError as Error} 
          onRetry={() => refetchLessons()} 
        />
      </div>
    );
  }

  // Показываем скелеты во время загрузки
  if (lessonsLoading || progressLoading) {
    return (
      <div className="p-4 space-y-4">
        {/* Header skeleton */}
        <div className="text-center space-y-3">
          <Skeleton className="h-8 w-48 mx-auto" />
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        </div>

        {/* Lessons skeletons */}
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <LessonSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  const progressPercentage = userProgress ? 
    (userProgress.completedLessons / userProgress.totalLessons) * 100 : 0;

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Основы менторинга
        </h1>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Прогресс курса</span>
            <span>
              {userProgress?.completedLessons || 0}/{userProgress?.totalLessons || 0} уроков
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="space-y-3">
        {lessons?.map((lesson) => (
          <Card
            key={lesson.id}
            className={`border-0 shadow-lg transition-all duration-300 ${
              lesson.unlocked 
                ? 'cursor-pointer active:scale-95' 
                : 'opacity-60 cursor-not-allowed'
            } ${
              lesson.completed 
                ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' 
                : lesson.unlocked 
                  ? 'bg-white' 
                  : 'bg-gray-50'
            }`}
            onClick={() => handleLessonClick(lesson)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {lesson.completed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : lesson.unlocked ? (
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Lock className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-xs font-medium text-muted-foreground">
                    Урок {lesson.id}
                  </span>
                </div>
                {lesson.completed && lesson.score && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    {lesson.score}%
                  </Badge>
                )}
              </div>
              <CardTitle className="text-base">{lesson.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <p className="text-sm text-muted-foreground">{lesson.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {lesson.duration} мин
                </div>
                {lesson.unlocked && (
                  <Button
                    size="sm"
                    variant={lesson.completed ? "outline" : "default"}
                    className={!lesson.completed ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xs h-7" : "text-xs h-7"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLessonClick(lesson);
                    }}
                  >
                    {lesson.completed ? "Повторить" : "Начать"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Lessons;
