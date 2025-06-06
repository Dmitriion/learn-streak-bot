
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Trophy, Clock, Target, TrendingUp, Play } from 'lucide-react';
import { useTelegram } from '../providers/TelegramProvider';
import { useTelegramNavigation } from '../hooks/useTelegramNavigation';

const Dashboard = () => {
  const { user, hideMainButton, hideBackButton } = useTelegram();
  const { navigate } = useTelegramNavigation();
  
  const studentData = {
    name: user ? `${user.first_name} ${user.last_name || ''}`.trim() : "Анна Петрова",
    currentCourse: "Основы коучинга",
    totalLessons: 15,
    completedLessons: 8,
    score: 85,
    streak: 5,
    timeSpent: 120
  };

  const recentLessons = [
    { id: 1, title: "Введение в коучинг", completed: true, score: 92 },
    { id: 2, title: "Активное слушание", completed: true, score: 88 },
    { id: 3, title: "Постановка вопросов", completed: true, score: 95 },
    { id: 4, title: "Работа с целями", completed: false, score: null }
  ];

  const progressPercentage = (studentData.completedLessons / studentData.totalLessons) * 100;

  useEffect(() => {
    // Скрываем кнопки на главной странице
    hideMainButton();
    hideBackButton();
  }, [hideMainButton, hideBackButton]);

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Добро пожаловать, {studentData.name}!
        </h1>
        <p className="text-muted-foreground text-sm">Продолжайте свое обучение и достигайте новых высот</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs">Прогресс курса</p>
                <p className="text-xl font-bold">{Math.round(progressPercentage)}%</p>
              </div>
              <BookOpen className="h-6 w-6 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs">Средний балл</p>
                <p className="text-xl font-bold">{studentData.score}%</p>
              </div>
              <Trophy className="h-6 w-6 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs">Дни подряд</p>
                <p className="text-xl font-bold">{studentData.streak}</p>
              </div>
              <Target className="h-6 w-6 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs">Время обучения</p>
                <p className="text-xl font-bold">{studentData.timeSpent}м</p>
              </div>
              <Clock className="h-6 w-6 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Progress */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            {studentData.currentCourse}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Прогресс курса</span>
              <span>{studentData.completedLessons}/{studentData.totalLessons} уроков</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={() => navigate('lessons')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm"
              size="sm"
            >
              <Play className="h-3 w-3 mr-1" />
              Продолжить
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('analytics')}
              size="sm"
              className="text-sm"
            >
              Аналитика
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Lessons */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Последние уроки</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentLessons.slice(0, 3).map((lesson) => (
              <div 
                key={lesson.id} 
                className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => navigate('lesson-detail', { lessonId: lesson.id })}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${lesson.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="font-medium text-sm">{lesson.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  {lesson.completed && lesson.score && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                      {lesson.score}%
                    </Badge>
                  )}
                  {!lesson.completed && (
                    <Badge variant="outline" className="text-xs">В процессе</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-sm h-12"
          onClick={() => navigate('test')}
        >
          <Trophy className="h-4 w-4 mr-1" />
          Пройти тест
        </Button>
        
        <Button 
          variant="outline" 
          className="text-sm h-12"
          onClick={() => navigate('lessons')}
        >
          <BookOpen className="h-4 w-4 mr-1" />
          Все уроки
        </Button>
      </div>

      {/* Achievement */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-orange-800 mb-1">🎉 Достижение!</h3>
          <p className="text-orange-700 text-sm">Вы прошли 50% курса! Продолжайте в том же духе!</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
