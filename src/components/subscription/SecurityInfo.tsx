
import React from 'react';
import { Shield, CreditCard } from 'lucide-react';

const SecurityInfo: React.FC = () => {
  return (
    <div className="text-center space-y-4 pt-6">
      <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
        <Shield className="h-4 w-4" />
        <span>Безопасная оплата через проверенные платежные системы</span>
      </div>
      <div className="flex justify-center space-x-6 text-xs text-muted-foreground">
        <div className="flex items-center space-x-1">
          <Shield className="h-3 w-3" />
          <span>SSL шифрование</span>
        </div>
        <div className="flex items-center space-x-1">
          <CreditCard className="h-3 w-3" />
          <span>Поддержка карт</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>📱</span>
          <span>Telegram Payments</span>
        </div>
      </div>
    </div>
  );
};

export default SecurityInfo;
