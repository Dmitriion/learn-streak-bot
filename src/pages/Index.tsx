
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, TrendingUp, Star, ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero секция */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Обучающая платформа по менторингу
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Профессиональное развитие через наставничество. 
            Изучите основы менторинга и станьте эффективным ментором.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Начать обучение
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline">
              Узнать больше
            </Button>
          </div>
        </div>

        {/* Особенности курса */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <BookOpen className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <CardTitle>Структурированное обучение</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                6 модулей с практическими заданиями и демонстрационными сессиями
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <Users className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <CardTitle>Реальные кейсы</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Изучение на примере реальных ситуаций из практики менторинга
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <TrendingUp className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <CardTitle>Отслеживание прогресса</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Детальная аналитика обучения и система достижений
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Программа курса */}
        <Card className="shadow-xl mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Программа курса</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: "Что такое менторинг", desc: "Отличие ментора от коуча и линейного руководителя" },
                { title: "Старт в менторинге", desc: "Подготовка и структура встреч знакомства" },
                { title: "Эффективная модель поведения ментора", desc: "Компетенции, обратная связь, уровни слушания" },
                { title: "Регулярная встреча", desc: "Постановка вопросов и структура встречи" },
                { title: "Управление прогрессом менти", desc: "Работа с препятствиями и завершение менторинга" },
                { title: "Отношения ментор-менти", desc: "Фазы отношений и ловушки ментора" }
              ].map((module, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">{module.title}</h3>
                    <p className="text-gray-600 text-sm">{module.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Отзывы */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-8">Что говорят студенты</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "Отличный курс! Структурированная подача материала и практические примеры помогли мне стать более эффективным ментором."
                </p>
                <div className="text-sm text-gray-500">— Мария Иванова, HR-директор</div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "Демонстрационные сессии особенно ценны. Видеть менторинг в действии - это лучший способ обучения."
                </p>
                <div className="text-sm text-gray-500">— Алексей Петров, Team Lead</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <Card className="shadow-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Готовы стать эффективным ментором?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Присоединяйтесь к тысячам профессионалов, которые уже освоили искусство менторинга 
              и помогают другим достигать новых высот в карьере.
            </p>
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Начать обучение сейчас
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
