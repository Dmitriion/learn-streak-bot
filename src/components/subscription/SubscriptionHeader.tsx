
import React from 'react';

interface SubscriptionHeaderProps {
  title: string;
  description: string;
}

const SubscriptionHeader: React.FC<SubscriptionHeaderProps> = ({ title, description }) => {
  return (
    <div className="text-center space-y-4">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="text-muted-foreground">
        {description}
      </p>
    </div>
  );
};

export default SubscriptionHeader;
