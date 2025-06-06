import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, Trophy, Target, BookOpen, Calendar, ArrowLeft, Award, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Analytics = () => {
  const navigate = useNavigate();

  // Данные для графиков
  const progressData = [
    { date: '1 нед', score: 65, lessons: 2 },
    { date: '2 нед', score: 72, lessons: 4 },
    { date: '3 нед', score: 78, lessons: 6 },
    { date: '4 нед', score: 85, lessons: 8 },
    { date: '5 нед', score: 88, lessons: 10 }
  ];

  const timeSpentData = [
    { day: 'Пн', time: 45 },
    { day: 'Вт', time: 60 },
    { day: 'Ср', time: 30 },
    { day: 'Чт', time: 75 },
    { day: 'Пт', time: 90 },
    { day: 'Сб', time: 20 },
    { day: 'Вс', time: 40 }
  ];

  const topicsData = [
    { name: 'Основы коучинга', value: 35, color: '#3b82f6' },
    { name: 'Активное слушание', value: 25, color: '#10b981' },
    { name: 'Постановка вопросов', value: 20, color: '#f59e0b' },
    { name: 'Работа с целями', value: 15, color: '#ef4444' },
    { name: 'Другое', value: 5, color: '#8b5cf6' }
  ];

  const achievements = [
    { id: 1, title: "Первые шаги", description: "Завершили первый урок", earned: true, date: "15.11.2024" },
    { id: 2, title: "Отличник", description: "Получили 90%+ в тесте", earned: true, date: "18.11.2024" },
    { id: 3, title: "Постоянство", description: "5 дней подряд", earned: true, date: "22.11.2024" },
    { id: 4, title: "Половина пути", description: "Прошли 50% курса", earned: true, date: "25.11.2024" },
    { id: 5, title: "Эксперт", description: "Завершите весь курс", earned: false, date: null }
  ];

  const weeklyStats = {
    totalTime: 360, // минуты
    averageScore: 85,
    lessonsCompleted: 3,
    streak: 5
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Аналитика обучения
            </h1>
            <p className="text-muted-foreground">Отслеживайте свой прогресс и достижения</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/advanced-analytics')}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <BarChart3 className="h-4 w-4" />
              Расширенная аналитика
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              На главную
            </Button>
          </div>
        </div>

        {/* Weekly Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Время на неделе</p>
                  <p className="text-2xl font-bold">{Math.floor(weeklyStats.totalTime / 60)}ч {weeklyStats.totalTime % 60}м</p>
                </div>
                <Clock className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Средний балл</p>
                  <p className="text-2xl font-bold">{weeklyStats.averageScore}%</p>
                </div>
                <Trophy className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Дни подряд</p>
                  <p className="text-2xl font-bold">{weeklyStats.streak}</p>
                </div>
                <Target className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Уроков за неделю</p>
                  <p className="text-2xl font-bold">{weeklyStats.lessonsCompleted}</p>
                </div>
                <BookOpen className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress Chart */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Прогресс обучения
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    fill="url(#progressGradient)" 
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Time Spent Chart */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Время изучения (минуты в день)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeSpentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="time" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Topics Distribution and Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Topics Distribution */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Распределение времени по темам</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={topicsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {topicsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="space-y-2">
                  {topicsData.map((topic, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: topic.color }}
                      />
                      <span className="text-sm flex-1">{topic.name}</span>
                      <span className="text-sm font-medium">{topic.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-600" />
                Достижения
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      achievement.earned 
                        ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200' 
                        : 'bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      achievement.earned ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}>
                      <Award className={`h-5 w-5 ${achievement.earned ? 'text-white' : 'text-gray-200'}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      {achievement.earned && achievement.date && (
                        <p className="text-xs text-yellow-600">{achievement.date}</p>
                      )}
                    </div>
                    {achievement.earned && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Получено
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Learning Goals */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Цели обучения
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Завершить курс</span>
                  <span className="text-sm text-muted-foreground">53%</span>
                </div>
                <Progress value={53} className="h-2" />
                <p className="text-sm text-muted-foreground">8 из 15 уроков</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Средний балл 90%+</span>
                  <span className="text-sm text-muted-foreground">85%</span>
                </div>
                <Progress value={85} className="h-2" />
                <p className="text-sm text-muted-foreground">Еще немного!</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">30 дней подряд</span>
                  <span className="text-sm text-muted-foreground">17%</span>
                </div>
                <Progress value={17} className="h-2" />
                <p className="text-sm text-muted-foreground">5 из 30 дней</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
