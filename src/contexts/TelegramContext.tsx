
import { createContext, useContext } from 'react';
import { TelegramContextType } from '../types/TelegramTypes';

const TelegramContext = createContext<TelegramContextType | null>(null);

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram должен использоваться внутри TelegramProvider');
  }
  return context;
};

export default TelegramContext;
