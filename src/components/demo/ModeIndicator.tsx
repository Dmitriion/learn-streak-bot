
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, Eye, Zap } from 'lucide-react';

interface ModeIndicatorProps {
  mode: 'demo' | 'admin' | 'production' | 'development';
  onSwitchToAdmin?: () => void;
  configurationStatus?: 'complete' | 'partial' | 'missing';
}

const ModeIndicator: React.FC<ModeIndicatorProps> = ({ 
  mode, 
  onSwitchToAdmin, 
  configurationStatus 
}) => {
  const getModeConfig = () => {
    switch (mode) {
      case 'demo':
        return {
          icon: Eye,
          label: 'Demo режим',
          variant: 'secondary' as const,
          color: 'bg-blue-100 text-blue-800'
        };
      case 'admin':
        return {
          icon: Settings,
          label: 'Админ панель',
          variant: 'default' as const,
          color: 'bg-red-100 text-red-800'
        };
      case 'development':
        return {
          icon: Zap,
          label: 'Разработка',
          variant: 'outline' as const,
          color: 'bg-yellow-100 text-yellow-800'
        };
      case 'production':
        return {
          icon: Zap,
          label: 'Продакшн',
          variant: 'default' as const,
          color: 'bg-green-100 text-green-800'
        };
    }
  };

  const config = getModeConfig();
  const Icon = config.icon;
  const isDevelopment = import.meta.env.DEV;

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <Badge variant={config.variant} className={`${config.color} font-medium`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>

      {configurationStatus && configurationStatus !== 'complete' && (
        <Badge variant="outline" className="bg-orange-100 text-orange-800">
          {configurationStatus === 'partial' ? 'Частично настроено' : 'Требует настройки'}
        </Badge>
      )}

      {isDevelopment && (
        <Badge variant="outline" className="bg-purple-100 text-purple-800">
          DEV
        </Badge>
      )}

      {mode === 'demo' && onSwitchToAdmin && isDevelopment && (
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onSwitchToAdmin}
          className="h-6 px-2 text-xs"
        >
          <Settings className="w-3 h-3 mr-1" />
          Admin
        </Button>
      )}
    </div>
  );
};

export default ModeIndicator;
