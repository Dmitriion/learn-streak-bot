
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Trophy, TrendingUp, Settings, Star } from 'lucide-react';
import AppStyles from '../app/AppStyles';
import ModeIndicator from './ModeIndicator';

const DemoApp = () => {
  const demoUser = {
    name: 'Анна Петрова',
    progress: 65,
    currentLesson: 3,
    totalLessons: 8,
    score: 420,
    streak: 5
  };

  const demoLessons = [
    { id: 1, title: 'Что такое менторинг', completed: true, locked: false },
    { id: 2, title: 'Старт в менторинге', completed: true, locked: false },
    { id: 3, title: 'Эффективная модель поведения ментора', completed: false, locked: false },
    { id: 4, title: 'Регулярная встреча', completed: false, locked: true },
    { id: 5, title: 'Управление прогрессом менти', completed: false, locked: true }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <AppStyles theme="light" viewportHeight={720} />
      <ModeIndicator mode="demo" />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Заголовок с приветствием */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Добро пожаловать в демо!
          </h1>
          <p className="text-gray-600 mb-4">
            Это интерактивная демонстрация обучающей платформы по менторингу
          </p>
          <Badge variant="secondary" className="mb-4">
            <Star className="w-4 h-4 mr-1" />
            Demo режим - полный функционал доступен после настройки
          </Badge>
        </div>

        {/* Карточка прогресса */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Прогресс обучения - {demoUser.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Общий прогресс</span>
              <span className="text-sm font-medium">{demoUser.progress}%</span>
            </div>
            <Progress value={demoUser.progress} className="h-3" />
            
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{demoUser.currentLesson}</div>
                <div className="text-xs text-gray-500">Текущий урок</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{demoUser.score}</div>
                <div className="text-xs text-gray-500">Очки</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{demoUser.streak}</div>
                <div className="text-xs text-gray-500">Дней подряд</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Уроки */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Курс "Основы менторинга"
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoLessons.map((lesson) => (
              <div
                key={lesson.id}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  lesson.completed
                    ? 'bg-green-50 border-green-200'
                    : lesson.locked
                    ? 'bg-gray-50 border-gray-200 opacity-60'
                    : 'bg-blue-50 border-blue-200 hover:shadow-md cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      lesson.completed
                        ? 'bg-green-500 text-white'
                        : lesson.locked
                        ? 'bg-gray-300 text-gray-500'
                        : 'bg-blue-500 text-white'
                    }`}>
                      {lesson.id}
                    </div>
                    <span className={`font-medium ${lesson.locked ? 'text-gray-500' : 'text-gray-800'}`}>
                      {lesson.title}
                    </span>
                  </div>
                  {lesson.completed && (
                    <Badge variant="default" className="bg-green-500">
                      Завершен
                    </Badge>
                  )}
                  {lesson.locked && (
                    <Badge variant="secondary">
                      Заблокирован
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Быстрые действия */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h3 className="font-bold mb-2">Аналитика прогресса</h3>
              <p className="text-sm text-gray-600 mb-4">
                Детальная статистика вашего обучения
              </p>
              <Button variant="outline" className="w-full">
                Открыть аналитику
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <Settings className="w-12 h-12 text-purple-500 mx-auto mb-3" />
              <h3 className="font-bold mb-2">Настройки</h3>
              <p className="text-sm text-gray-600 mb-4">
                Персонализация обучения под ваши нужды
              </p>
              <Button variant="outline" className="w-full">
                Настроить
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="shadow-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Готовы начать полноценное обучение?</h3>
            <p className="text-gray-600 mb-4">
              В демо-режиме доступен ограниченный функционал. Для полного доступа к платформе 
              обратитесь к администратору для настройки приложения.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Связаться с администратором
              </Button>
              <Button variant="outline">
                Узнать больше о курсе
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DemoApp;
