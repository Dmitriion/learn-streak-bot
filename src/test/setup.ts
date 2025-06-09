
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Telegram WebApp API
const mockTelegramWebApp = {
  ready: vi.fn(),
  expand: vi.fn(),
  close: vi.fn(),
  MainButton: {
    text: '',
    color: '#2481cc',
    textColor: '#ffffff',
    isVisible: false,
    isActive: true,
    setText: vi.fn(),
    onClick: vi.fn(),
    offClick: vi.fn(),
    show: vi.fn(),
    hide: vi.fn(),
    enable: vi.fn(),
    disable: vi.fn(),
    showProgress: vi.fn(),
    hideProgress: vi.fn(),
    setParams: vi.fn()
  },
  BackButton: {
    isVisible: false,
    onClick: vi.fn(),
    offClick: vi.fn(),
    show: vi.fn(),
    hide: vi.fn()
  },
  HapticFeedback: {
    impactOccurred: vi.fn(),
    notificationOccurred: vi.fn(),
    selectionChanged: vi.fn()
  },
  showAlert: vi.fn(),
  showConfirm: vi.fn(),
  showPopup: vi.fn(),
  showScanQrPopup: vi.fn(),
  closeScanQrPopup: vi.fn(),
  readTextFromClipboard: vi.fn(),
  openTelegramLink: vi.fn(),
  openInvoice: vi.fn(),
  onEvent: vi.fn(),
  offEvent: vi.fn(),
  sendData: vi.fn(),
  switchInlineQuery: vi.fn(),
  colorScheme: 'light' as const,
  themeParams: {
    bg_color: '#ffffff',
    text_color: '#000000',
    hint_color: '#999999',
    link_color: '#2481cc',
    button_color: '#2481cc',
    button_text_color: '#ffffff',
    secondary_bg_color: '#f1f1f1'
  },
  isExpanded: true,
  viewportHeight: 720,
  viewportStableHeight: 720,
  isClosingConfirmationEnabled: false,
  headerColor: '#2481cc',
  backgroundColor: '#ffffff',
  isVerticalSwipesEnabled: true,
  initData: '',
  initDataUnsafe: {
    user: {
      id: 12345,
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser',
      language_code: 'ru',
      is_premium: false,
      allows_write_to_pm: true
    },
    chat_type: 'private',
    auth_date: Math.floor(Date.now() / 1000),
    hash: 'test_hash'
  },
  version: '7.0',
  platform: 'web',
  CloudStorage: {
    setItem: vi.fn().mockResolvedValue(undefined),
    getItem: vi.fn().mockResolvedValue(null),
    getItems: vi.fn().mockResolvedValue({}),
    removeItem: vi.fn().mockResolvedValue(undefined),
    removeItems: vi.fn().mockResolvedValue(undefined),
    getKeys: vi.fn().mockResolvedValue([])
  }
};

// Глобальный mock для Telegram
Object.defineProperty(window, 'Telegram', {
  value: {
    WebApp: mockTelegramWebApp
  },
  writable: true
});

// Mock для environment переменных
vi.mock('import.meta', () => ({
  env: {
    DEV: true,
    PROD: false,
    MODE: 'test',
    VITE_N8N_WEBHOOK_URL: 'https://test-n8n.com/webhook',
    VITE_ADMIN_USER_IDS: '12345,67890',
    VITE_ENABLE_MOCK_MODE: 'true'
  }
}));

// Mock для localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock для fetch
global.fetch = vi.fn();

// Сбрасываем все моки перед каждым тестом
beforeEach(() => {
  vi.clearAllMocks();
});
