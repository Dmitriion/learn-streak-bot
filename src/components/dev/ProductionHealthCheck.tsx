
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Zap } from 'lucide-react';
import { useHealthChecks } from '../../hooks/useHealthChecks';
import HealthCheckItem from './HealthCheckItem';
import HealthScoreDisplay from './HealthScoreDisplay';

const ProductionHealthCheck: React.FC = () => {
  const { checks, overallScore, isChecking, runHealthChecks } = useHealthChecks();

  useEffect(() => {
    runHealthChecks();
  }, []);

  if (import.meta.env.PROD) {
    return null; // Не показываем в production
  }

  return (
    <Card className="m-4 border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Production Health Check
          <HealthScoreDisplay score={overallScore} />
          <Button 
            onClick={runHealthChecks} 
            disabled={isChecking}
            size="sm"
            variant="outline"
          >
            <Zap className="h-4 w-4" />
            {isChecking ? 'Проверка...' : 'Перепроверить'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {checks.map((check, index) => (
            <HealthCheckItem key={index} check={check} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductionHealthCheck;
