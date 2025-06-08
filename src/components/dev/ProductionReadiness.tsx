
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Gauge } from 'lucide-react';
import { useBuildValidation } from '../../hooks/useBuildValidation';

const ProductionReadiness: React.FC = () => {
  const { isValid, errors, readinessScore, checks } = useBuildValidation();

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  if (import.meta.env.PROD && readinessScore === 100) {
    return null; // Не показываем в production если все отлично
  }

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-5 w-5" />
          Production Readiness
          <Badge variant={getScoreBadgeVariant(readinessScore)}>
            {readinessScore}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Общий статус */}
        <div className={`text-2xl font-bold ${getScoreColor(readinessScore)}`}>
          {readinessScore === 100 ? '✅ Готово к production' : 
           readinessScore >= 90 ? '🟡 Почти готово' : 
           '🔴 Требуется доработка'}
        </div>

        {/* Ошибки */}
        {errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-red-600">Критические проблемы:</h4>
            {errors.map((error, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-red-600">
                <XCircle className="h-4 w-4" />
                {error}
              </div>
            ))}
          </div>
        )}

        {/* Детальные проверки */}
        <div className="space-y-2">
          <h4 className="font-semibold">Детальная проверка:</h4>
          {checks.map((check, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                {check.passed ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : check.critical ? (
                  <XCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                )}
                {check.name}
              </span>
              {check.critical && !check.passed && (
                <Badge variant="destructive" className="text-xs">
                  Критично
                </Badge>
              )}
            </div>
          ))}
        </div>

        {/* Рекомендации */}
        {readinessScore < 100 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
            <h5 className="font-semibold text-blue-800 mb-2">Рекомендации:</h5>
            <ul className="space-y-1 text-blue-700">
              {!checks.find(c => c.name.includes('HTTPS'))?.passed && (
                <li>• Разверните приложение на HTTPS хостинге</li>
              )}
              {!checks.find(c => c.name.includes('N8N'))?.passed && (
                <li>• Настройте N8N Webhook URL в настройках</li>
              )}
              {!checks.find(c => c.name.includes('Mock'))?.passed && (
                <li>• Отключите Mock режим для production</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductionReadiness;
