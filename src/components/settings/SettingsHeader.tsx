
import React from 'react';
import { Settings } from 'lucide-react';

const SettingsHeader: React.FC = () => {
  return (
    <div className="text-center space-y-3">
      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        <Settings className="h-8 w-8 text-white" />
      </div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Настройки
      </h1>
    </div>
  );
};

export default SettingsHeader;
