
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, Trophy, Target, BookOpen, Download, ArrowLeft, Activity, Users, Zap, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';
import { useToast } from '@/hooks/use-toast';

const AdvancedAnalytics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    currentReport,
    realtimeMetrics,
    isGeneratingReport,
    generateReport,
    updateRealtimeMetrics,
    downloadCSV
  } = useAnalytics();

  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'quarter'>('week');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    generateReport(selectedPeriod);
    updateRealtimeMetrics();
    
    // Обновляем real-time метрики каждые 30 секунд
    const interval = setInterval(updateRealtimeMetrics, 30000);
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const handlePeriodChange = (period: 'day' | 'week' | 'month' | 'quarter') => {
    setSelectedPeriod(period);
  };

  const handleExportReport = () => {
    if (!currentReport) {
      toast({
        title: "Ошибка",
        description: "Нет данных для экспорта",
        variant: "destructive",
      });
      return;
    }

    const filename = `analytics_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(currentReport, filename);
    
    toast({
      title: "Успешно",
      description: "Отчет загружен",
    });
  };

  if (isGeneratingReport && !currentReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Генерируем отчет...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Расширенная аналитика
            </h1>
            <p className="text-muted-foreground">Детальный анализ вашего обучения и прогресса</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">День</SelectItem>
                <SelectItem value="week">Неделя</SelectItem>
                <SelectItem value="month">Месяц</SelectItem>
                <SelectItem value="quarter">Квартал</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={handleExportReport}
              className="flex items-center gap-2"
              disabled={!currentReport}
            >
              <Download className="h-4 w-4" />
              Экспорт
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/analytics')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Button>
          </div>
        </div>

        {/* Real-time Metrics */}
        {realtimeMetrics && (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Real-time метрики
                </h3>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  Обновлено: {new Date(realtimeMetrics.last_updated).toLocaleTimeString()}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{realtimeMetrics.active_users}</div>
                  <div className="text-sm opacity-80">Активных пользователей</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{realtimeMetrics.current_lessons_in_progress}</div>
                  <div className="text-sm opacity-80">Уроков в процессе</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{Math.round(realtimeMetrics.average_page_load_time)}мс</div>
                  <div className="text-sm opacity-80">Время загрузки</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{(realtimeMetrics.error_rate * 100).toFixed(1)}%</div>
                  <div className="text-sm opacity-80">Ошибок</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentReport && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Обзор</TabsTrigger>
              <TabsTrigger value="learning">Обучение</TabsTrigger>
              <TabsTrigger value="engagement">Вовлеченность</TabsTrigger>
              <TabsTrigger value="trends">Тренды</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Завершено уроков</p>
                        <p className="text-2xl font-bold">{currentReport.learning_summary.completed_lessons}</p>
                      </div>
                      <BookOpen className="h-8 w-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Средний балл</p>
                        <p className="text-2xl font-bold">{currentReport.learning_summary.average_score}%</p>
                      </div>
                      <Trophy className="h-8 w-8 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">Дней подряд</p>
                        <p className="text-2xl font-bold">{currentReport.learning_summary.streak_days}</p>
                      </div>
                      <Target className="h-8 w-8 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm">Время обучения</p>
                        <p className="text-2xl font-bold">{Math.floor(currentReport.learning_summary.total_study_time / 3600)}ч</p>
                      </div>
                      <Clock className="h-8 w-8 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    Рекомендации
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentReport.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <p className="text-sm text-gray-700">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="learning" className="space-y-6">
              {/* Learning Progress Chart */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Динамика баллов
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={currentReport.performance_trends.scores_trend.map((score, index) => ({ day: index + 1, score }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="score" stroke="#3b82f6" fill="url(#scoresGradient)" strokeWidth={2} />
                      <defs>
                        <linearGradient id="scoresGradient" x1="0" y1="0" x2="0" y2="1">
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
                    <BarChart data={currentReport.performance_trends.time_trend.map((time, index) => ({ day: index + 1, time }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="time" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="engagement" className="space-y-6">
              {/* Engagement Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Статистика сессий</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Всего сессий</span>
                        <span className="font-bold">{currentReport.engagement_summary.sessions_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Средняя длительность</span>
                        <span className="font-bold">{Math.round(currentReport.engagement_summary.average_session_duration / 60)} мин</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Самый активный день</span>
                        <span className="font-bold">{currentReport.engagement_summary.most_active_day}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Предпочитаемое время</span>
                        <span className="font-bold">{currentReport.engagement_summary.preferred_study_time}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5" />
                      Telegram Метрики
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Платформа</span>
                        <Badge variant="secondary">Web App</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Тема</span>
                        <Badge variant="outline">Светлая</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Haptic Feedback</span>
                        <Badge variant="secondary">Включен</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Кнопка "Назад"</span>
                        <span className="font-bold">5 нажатий</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Engagement Chart */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Динамика вовлеченности</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={currentReport.performance_trends.engagement_trend.map((engagement, index) => ({ day: index + 1, engagement }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="engagement" stroke="#8b5cf6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              {/* Combined Trends */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Сводные тренды</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={currentReport.performance_trends.scores_trend.map((_, index) => ({
                      day: index + 1,
                      scores: currentReport.performance_trends.scores_trend[index],
                      time: currentReport.performance_trends.time_trend[index],
                      engagement: currentReport.performance_trends.engagement_trend[index]
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="scores" stroke="#3b82f6" strokeWidth={2} name="Баллы" />
                      <Line type="monotone" dataKey="time" stroke="#10b981" strokeWidth={2} name="Время (мин)" />
                      <Line type="monotone" dataKey="engagement" stroke="#8b5cf6" strokeWidth={2} name="Вовлеченность" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Progress towards goals */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Прогресс к целям</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Завершить курс</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round((currentReport.learning_summary.completed_lessons / 15) * 100)}%
                        </span>
                      </div>
                      <Progress value={(currentReport.learning_summary.completed_lessons / 15) * 100} className="h-2" />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Средний балл 90%+</span>
                        <span className="text-sm text-muted-foreground">
                          {currentReport.learning_summary.average_score}%
                        </span>
                      </div>
                      <Progress value={Math.min(currentReport.learning_summary.average_score, 100)} className="h-2" />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">30 дней подряд</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round((currentReport.learning_summary.streak_days / 30) * 100)}%
                        </span>
                      </div>
                      <Progress value={(currentReport.learning_summary.streak_days / 30) * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
