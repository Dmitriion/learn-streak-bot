
/**
 * Типы контекста и провайдеров Telegram
 */

import React from 'react';
import { TelegramAuthState, TelegramWebAppState } from './State';
import { TelegramHapticFeedbackType, TelegramPaymentStatus } from './Events';

/**
 * Тип контекста Telegram
 */
export interface TelegramContextType extends TelegramAuthState, TelegramWebAppState {
  /** Показать главную кнопку */
  showMainButton: (text: string, onClick: () => void) => void;
  /** Скрыть главную кнопку */
  hideMainButton: () => void;
  /** Показать кнопку назад */
  showBackButton: (onClick: () => void) => void;
  /** Скрыть кнопку назад */
  hideBackButton: () => void;
  /** Haptic feedback */
  hapticFeedback: (type: TelegramHapticFeedbackType) => void;
  /** Показать алерт */
  showAlert: (message: string) => void;
  /** Показать подтверждение */
  showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
  /** Расширить WebApp */
  expand: () => void;
  /** Сообщить о готовности */
  ready: () => void;
  /** Зарегистрировать пользователя */
  registerUser: (fullName: string) => Promise<void>;
  /** Установить webhook URL */
  setWebhookUrl: (url: string) => void;
  /** Включить подтверждение закрытия */
  enableClosingConfirmation: () => void;
  /** Отключить подтверждение закрытия */
  disableClosingConfirmation: () => void;
  /** Открыть ссылку Telegram */
  openTelegramLink: (url: string) => void;
  /** Открыть инвойс */
  openInvoice: (url: string, callback?: (status: TelegramPaymentStatus) => void) => void;
  /** Сохранить в облако */
  saveToCloud: (key: string, data: any) => Promise<boolean>;
  /** Загрузить из облака */
  loadFromCloud: (key: string) => Promise<any>;
}

/**
 * Свойства провайдера Telegram
 */
export interface TelegramProviderProps {
  /** Дочерние элементы */
  children: React.ReactNode;
}
