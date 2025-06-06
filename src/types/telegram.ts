
import { AuthState } from '../services/AuthService';

export interface TelegramContextType extends AuthState {
  isReady: boolean;
  viewportHeight: number;
  isExpanded: boolean;
  isClosingConfirmationEnabled: boolean;
  showMainButton: (text: string, onClick: () => void) => void;
  hideMainButton: () => void;
  showBackButton: (onClick: () => void) => void;
  hideBackButton: () => void;
  hapticFeedback: (type: 'light' | 'medium' | 'heavy') => void;
  showAlert: (message: string) => void;
  showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
  expand: () => void;
  ready: () => void;
  theme: 'light' | 'dark';
  registerUser: (fullName: string) => Promise<void>;
  setWebhookUrl: (url: string) => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  openTelegramLink: (url: string) => void;
  openInvoice: (url: string, callback?: (status: string) => void) => void;
  saveToCloud: (key: string, data: any) => Promise<boolean>;
  loadFromCloud: (key: string) => Promise<any>;
}

export interface TelegramProviderProps {
  children: React.ReactNode;
}
