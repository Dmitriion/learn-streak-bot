
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Trophy, Clock, Target, TrendingUp, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const studentData = {
    name: "Анна Петрова",
    currentCourse: "Основы коучинга",
    totalLessons: 15,
    completedLessons: 8,
    score: 85,
    streak: 5,
    timeSpent: 120 // в минутах
  };

  const recentLessons = [
    { id: 1, title: "Введение в коучинг", completed: true, score: 92 },
    { id: 2, title: "Активное слушание", completed: true, score: 88 },
    { id: 3, title: "Постановка вопросов", completed: true, score: 95 },
    { id: 4, title: "Работа с целями", completed: false, score: null }
  ];

  const progressPercentage = (studentData.completedLessons / studentData.totalLessons) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Добро пожаловать, {studentData.name}!
          </h1>
          <p className="text-muted-foreground">Продолжайте свое обучение и достигайте новых высот</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Прогресс курса</p>
                  <p className="text-2xl font-bold">{Math.round(progressPercentage)}%</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Средний балл</p>
                  <p className="text-2xl font-bold">{studentData.score}%</p>
                </div>
                <Trophy className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Дни подряд</p>
                  <p className="text-2xl font-bold">{studentData.streak}</p>
                </div>
                <Target className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Время обучения</p>
                  <p className="text-2xl font-bold">{studentData.timeSpent}м</p>
                </div>
                <Clock className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Progress */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Текущий курс: {studentData.currentCourse}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Прогресс курса</span>
                    <span>{studentData.completedLessons}/{studentData.totalLessons} уроков</span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => navigate('/lessons')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Продолжить обучение
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/analytics')}
                  >
                    Аналитика
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Lessons */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Последние уроки</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentLessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${lesson.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="font-medium">{lesson.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {lesson.completed && lesson.score && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {lesson.score}%
                          </Badge>
                        )}
                        {!lesson.completed && (
                          <Badge variant="outline">В процессе</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Быстрые действия</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  onClick={() => navigate('/test')}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Пройти тест
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/lessons')}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Все уроки
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/analytics')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Моя аналитика
                </Button>
              </CardContent>
            </Card>

            {/* Achievement */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800">🎉 Достижение!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-700">Вы прошли 50% курса! Продолжайте в том же духе!</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
