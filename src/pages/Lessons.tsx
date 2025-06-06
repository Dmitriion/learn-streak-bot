
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, CheckCircle, Clock, Lock, Play, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Lessons = () => {
  const navigate = useNavigate();
  const [selectedLesson, setSelectedLesson] = useState(null);

  const lessons = [
    {
      id: 1,
      title: "Введение в коучинг",
      description: "Основные принципы и философия коучинга",
      duration: 15,
      completed: true,
      score: 92,
      content: "Коучинг — это процесс содействия обучению и развитию, который повышает эффективность деятельности людей...",
      unlocked: true
    },
    {
      id: 2,
      title: "Активное слушание",
      description: "Техники эффективного слушания клиента",
      duration: 20,
      completed: true,
      score: 88,
      content: "Активное слушание — это фундаментальный навык коуча, который включает в себя полное внимание к клиенту...",
      unlocked: true
    },
    {
      id: 3,
      title: "Постановка вопросов",
      description: "Искусство задавать правильные вопросы",
      duration: 18,
      completed: true,
      score: 95,
      content: "Мощные вопросы помогают клиенту глубже понять себя и найти собственные решения...",
      unlocked: true
    },
    {
      id: 4,
      title: "Работа с целями",
      description: "Методы постановки и достижения целей",
      duration: 25,
      completed: false,
      score: null,
      content: "SMART-цели и техники их достижения в коучинге...",
      unlocked: true
    },
    {
      id: 5,
      title: "Работа с убеждениями",
      description: "Выявление и трансформация ограничивающих убеждений",
      duration: 30,
      completed: false,
      score: null,
      content: "Ограничивающие убеждения могут препятствовать достижению целей...",
      unlocked: false
    }
  ];

  const completedLessons = lessons.filter(lesson => lesson.completed).length;
  const progressPercentage = (completedLessons / lessons.length) * 100;

  const handleLessonClick = (lesson) => {
    if (lesson.unlocked) {
      setSelectedLesson(lesson);
    }
  };

  const handleStartTest = (lessonId) => {
    navigate(`/test?lesson=${lessonId}`);
  };

  if (selectedLesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setSelectedLesson(null)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад к урокам
            </Button>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedLesson.title}</CardTitle>
                  <p className="text-muted-foreground">{selectedLesson.description}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-2">
                    <Clock className="h-3 w-3 mr-1" />
                    {selectedLesson.duration} мин
                  </Badge>
                  {selectedLesson.completed && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Завершен: {selectedLesson.score}%</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose max-w-none">
                <p className="text-lg leading-relaxed">{selectedLesson.content}</p>
                
                <div className="bg-blue-50 p-4 rounded-lg my-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Ключевые моменты:</h3>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Понимание основных принципов</li>
                    <li>• Практическое применение техник</li>
                    <li>• Развитие навыков самоанализа</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Практическое задание:</h3>
                  <p className="text-green-700">
                    Примените изученную технику в реальной ситуации и зафиксируйте результаты.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                {!selectedLesson.completed ? (
                  <Button
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    onClick={() => handleStartTest(selectedLesson.id)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Пройти тест
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => handleStartTest(selectedLesson.id)}
                  >
                    Пересдать тест
                  </Button>
                )}
                <Button variant="outline">
                  Сохранить заметки
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Курс: Основы коучинга
          </h1>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground max-w-md mx-auto">
              <span>Прогресс курса</span>
              <span>{completedLessons}/{lessons.length} уроков</span>
            </div>
            <Progress value={progressPercentage} className="h-3 max-w-md mx-auto" />
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <Card
              key={lesson.id}
              className={`border-0 shadow-lg transition-all duration-300 cursor-pointer ${
                lesson.unlocked 
                  ? 'hover:shadow-xl hover:scale-105' 
                  : 'opacity-60 cursor-not-allowed'
              } ${
                lesson.completed 
                  ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' 
                  : lesson.unlocked 
                    ? 'bg-white hover:bg-blue-50' 
                    : 'bg-gray-50'
              }`}
              onClick={() => handleLessonClick(lesson)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {lesson.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : lesson.unlocked ? (
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Lock className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-muted-foreground">
                      Урок {lesson.id}
                    </span>
                  </div>
                  {lesson.completed && lesson.score && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {lesson.score}%
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{lesson.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{lesson.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {lesson.duration} мин
                  </div>
                  {lesson.unlocked && (
                    <Button
                      size="sm"
                      variant={lesson.completed ? "outline" : "default"}
                      className={!lesson.completed ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" : ""}
                    >
                      {lesson.completed ? "Повторить" : "Начать"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Back to Dashboard */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Вернуться на главную
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Lessons;
