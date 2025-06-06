import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Play } from 'lucide-react';
import { useTelegram } from '../providers/TelegramProvider';
import { useTelegramNavigation } from '../hooks/useTelegramNavigation';

export interface LessonDetailProps {
  lessonId?: number;
}

const LessonDetail: React.FC<LessonDetailProps> = ({ lessonId = 1 }) => {
  const { showMainButton, hideMainButton, hapticFeedback } = useTelegram();
  const { navigate } = useTelegramNavigation();

  const lesson = {
    id: lessonId,
    title: "Введение в коучинг",
    description: "Основные принципы и философия коучинга",
    duration: 15,
    completed: false,
    score: null,
    content: "Коучинг — это процесс содействия обучению и развитию, который повышает эффективность деятельности людей. В этом уроке мы изучим основные принципы коучинга и его отличия от других форм консультирования.",
    unlocked: true
  };

  useEffect(() => {
    if (!lesson.completed) {
      showMainButton('Пройти тест', () => {
        hapticFeedback('medium');
        navigate('test', { lessonId: lesson.id });
      });
    } else {
      showMainButton('Пересдать тест', () => {
        hapticFeedback('medium');
        navigate('test', { lessonId: lesson.id });
      });
    }

    return () => {
      hideMainButton();
    };
  }, [lesson.completed, lesson.id, showMainButton, hideMainButton, hapticFeedback, navigate]);

  return (
    <div className="p-4 space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{lesson.title}</CardTitle>
              <p className="text-muted-foreground mt-2">{lesson.description}</p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="mb-2">
                <Clock className="h-3 w-3 mr-1" />
                {lesson.duration} мин
              </Badge>
              {lesson.completed && (
                <div className="flex items-center gap-1 text-green-600 mt-1">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Завершен: {lesson.score}%</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose max-w-none">
            <p className="text-lg leading-relaxed">{lesson.content}</p>
            
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
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonDetail;
