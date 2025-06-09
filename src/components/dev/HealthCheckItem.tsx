
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Shield } from 'lucide-react';

interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  critical: boolean;
}

interface HealthCheckItemProps {
  check: HealthCheck;
}

const HealthCheckItem: React.FC<HealthCheckItemProps> = ({ check }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800 border-green-200">PASS</Badge>;
      case 'fail':
        return <Badge variant="destructive">FAIL</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">WARNING</Badge>;
      default:
        return <Badge variant="outline">UNKNOWN</Badge>;
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        {getStatusIcon(check.status)}
        <div>
          <div className="font-medium flex items-center gap-2">
            {check.name}
            {check.critical && (
              <Badge variant="outline" className="text-xs">CRITICAL</Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">{check.message}</div>
        </div>
      </div>
      {getStatusBadge(check.status)}
    </div>
  );
};

export default HealthCheckItem;
