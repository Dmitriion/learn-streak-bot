
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, CheckCircle, Clock, Lock } from 'lucide-react';
import { useTelegram } from '../providers/TelegramProvider';
import { useTelegramNavigation } from '../hooks/useTelegramNavigation';

const Lessons = () => {
  const { hideMainButton, hapticFeedback } = useTelegram();
  const { navigate } = useTelegramNavigation();

  const lessons = [
    {
      id: 1,
      title: "Введение в коучинг",
      description: "Основные принципы и философия коучинга",
      duration: 15,
      completed: true,
      score: 92,
      unlocked: true
    },
    {
      id: 2,
      title: "Активное слушание",
      description: "Техники эффективного слушания клиента",
      duration: 20,
      completed: true,
      score: 88,
      unlocked: true
    },
    {
      id: 3,
      title: "Постановка вопросов",
      description: "Искусство задавать правильные вопросы",
      duration: 18,
      completed: true,
      score: 95,
      unlocked: true
    },
    {
      id: 4,
      title: "Работа с целями",
      description: "Методы постановки и достижения целей",
      duration: 25,
      completed: false,
      score: null,
      unlocked: true
    },
    {
      id: 5,
      title: "Работа с убеждениями",
      description: "Выявление и трансформация ограничивающих убеждений",
      duration: 30,
      completed: false,
      score: null,
      unlocked: false
    }
  ];

  const completedLessons = lessons.filter(lesson => lesson.completed).length;
  const progressPercentage = (completedLessons / lessons.length) * 100;

  useEffect(() => {
    hideMainButton();
  }, [hideMainButton]);

  const handleLessonClick = (lesson: any) => {
    if (lesson.unlocked) {
      hapticFeedback('light');
      navigate('lesson-detail', { lessonId: lesson.id });
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Основы коучинга
        </h1>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Прогресс курса</span>
            <span>{completedLessons}/{lessons.length} уроков</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="space-y-3">
        {lessons.map((lesson) => (
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
