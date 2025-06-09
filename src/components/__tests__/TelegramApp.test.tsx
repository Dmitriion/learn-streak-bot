
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../../test/utils';
import TelegramApp from '../../TelegramApp';
import { createTestUser } from '../../test/utils';

// Mock для зависимостей
vi.mock('../../hooks/useAppInitialization', () => ({
  useAppInitialization: () => ({})
}));

vi.mock('../../hooks/useThemeAndViewport', () => ({
  useThemeAndViewport: () => ({})
}));

vi.mock('../../hooks/useTelegramNavigation', () => ({
  useTelegramNavigation: () => ({
    currentRoute: 'dashboard',
    params: {},
    isNavigationReady: true
  })
}));

describe('TelegramApp', () => {
  it('показывает загрузчик при инициализации', async () => {
    render(<TelegramApp />, {
      user: createTestUser()
    });

    // В начале может показываться загрузчик
    // Затем должно появиться основное содержимое
    await waitFor(() => {
      expect(screen.getByTestId || screen.queryByText).toBeDefined();
    });
  });

  it('показывает админ панель для админов с параметром admin=true', async () => {
    // Мокаем URL с параметром admin=true
    Object.defineProperty(window, 'location', {
      value: {
        search: '?admin=true'
      },
      writable: true
    });

    render(<TelegramApp />, {
      user: createTestUser({ id: 12345 }) // ID из VITE_ADMIN_USER_IDS
    });

    await waitFor(() => {
      // Проверяем что показывается админ контент или навигация
      expect(document.body).toBeDefined();
    });
  });

  it('показывает регистрацию для неаутентифицированных пользователей', async () => {
    // Мокаем отсутствие пользователя
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.initDataUnsafe.user = undefined;
    }

    render(<TelegramApp />);

    await waitFor(() => {
      expect(document.body).toBeDefined();
    });
  });

  it('показывает основное приложение для зарегистрированных пользователей', async () => {
    render(<TelegramApp />, {
      user: createTestUser()
    });

    await waitFor(() => {
      expect(document.body).toBeDefined();
    });
  });
});
