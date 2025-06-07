
import { useTelegramInit } from './telegram/useTelegramInit';
import { useTelegramButtons } from './telegram/useTelegramButtons';
import { useTelegramUI } from './telegram/useTelegramUI';
import { useTelegramCloudSync } from './telegram/useTelegramCloudSync';
import { useTelegramLifecycle } from './telegram/useTelegramLifecycle';
import { useTelegramPayments } from './telegram/useTelegramPayments';

export const useTelegramWebApp = () => {
  const initFeatures = useTelegramInit();
  const buttonFeatures = useTelegramButtons();
  const uiFeatures = useTelegramUI();
  const cloudFeatures = useTelegramCloudSync();
  const lifecycleFeatures = useTelegramLifecycle();
  const paymentFeatures = useTelegramPayments();

  return {
    ...initFeatures,
    ...buttonFeatures,
    ...uiFeatures,
    ...cloudFeatures,
    ...lifecycleFeatures,
    ...paymentFeatures
  };
};
