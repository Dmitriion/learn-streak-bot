
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface HealthScoreDisplayProps {
  score: number;
}

const HealthScoreDisplay: React.FC<HealthScoreDisplayProps> = ({ score }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReadinessMessage = (score: number) => {
    if (score >= 95) return 'Готов к production deployment';
    if (score >= 85) return 'Почти готов, мелкие доработки';
    if (score >= 70) return 'Требуются исправления';
    return 'Не готов к production';
  };

  return (
    <>
      <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
        {score}%
      </div>
      <div className="text-sm text-muted-foreground">
        {getReadinessMessage(score)}
      </div>
      {score >= 95 && (
        <div className="mt-6 p-4 bg-green-50 border-green-200 border rounded-lg">
          <div className="flex items-center gap-2 text-green-800 font-medium">
            <CheckCircle className="h-5 w-5" />
            Приложение готово к production deployment!
          </div>
          <div className="text-sm text-green-700 mt-1">
            Все критические проверки пройдены. Можно безопасно деплоить в Telegram.
          </div>
        </div>
      )}
    </>
  );
};

export default HealthScoreDisplay;
