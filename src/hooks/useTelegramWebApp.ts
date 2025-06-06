
import { useTelegramInit } from './telegram/useTelegramInit';
import { useTelegramButtons } from './telegram/useTelegramButtons';
import { useTelegramUI } from './telegram/useTelegramUI';
import { useTelegramCloudSync } from './telegram/useTelegramCloudSync';

export const useTelegramWebApp = () => {
  const initFeatures = useTelegramInit();
  const buttonFeatures = useTelegramButtons();
  const uiFeatures = useTelegramUI();
  const cloudFeatures = useTelegramCloudSync();

  return {
    ...initFeatures,
    ...buttonFeatures,
    ...uiFeatures,
    ...cloudFeatures
  };
};
