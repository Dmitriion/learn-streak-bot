
import { useEffect } from 'react';

interface UseThemeAndViewportProps {
  theme: 'light' | 'dark';
  viewportHeight: number;
}

export const useThemeAndViewport = ({ theme, viewportHeight }: UseThemeAndViewportProps) => {
  useEffect(() => {
    // Применяем тему Telegram к документу
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = theme === 'dark' ? 'dark' : '';
    
    // Устанавливаем CSS переменные для viewport
    document.documentElement.style.setProperty('--tg-viewport-height', `${viewportHeight}px`);
  }, [theme, viewportHeight]);
};
