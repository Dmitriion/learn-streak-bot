
import React from 'react';

interface AppStylesProps {
  theme: 'light' | 'dark';
  viewportHeight: number;
}

const AppStyles: React.FC<AppStylesProps> = ({ theme, viewportHeight }) => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        .telegram-app {
          height: var(--tg-viewport-height, 100vh);
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
        
        [data-theme="dark"] {
          --background: 0 0% 7%;
          --foreground: 210 40% 98%;
          --card: 0 0% 7%;
          --card-foreground: 210 40% 98%;
          --primary: 210 40% 98%;
          --primary-foreground: 222.2 47.4% 11.2%;
          --secondary: 217.2 32.6% 17.5%;
          --secondary-foreground: 210 40% 98%;
          --muted: 217.2 32.6% 17.5%;
          --muted-foreground: 215 20.2% 65.1%;
          --accent: 217.2 32.6% 17.5%;
          --accent-foreground: 210 40% 98%;
          --border: 217.2 32.6% 17.5%;
          --input: 217.2 32.6% 17.5%;
        }
        
        [data-theme="dark"] .bg-gradient-to-br {
          background: linear-gradient(to bottom right, rgb(15 23 42), rgb(30 27 75), rgb(88 28 135));
        }
        
        /* Telegram-specific optimizations */
        @media (max-height: 600px) {
          .telegram-app {
            padding: 8px;
          }
        }
        
        /* Performance optimizations */
        .telegram-app * {
          will-change: auto;
        }
        
        .telegram-app img {
          loading: lazy;
        }
        
        /* Smooth transitions for viewport changes */
        .telegram-app {
          transition: height 0.3s ease;
        }
      `
    }} />
  );
};

export default AppStyles;
